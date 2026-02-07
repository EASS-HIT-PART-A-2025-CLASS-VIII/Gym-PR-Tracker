from datetime import datetime, timezone
from sqlmodel import select, func, and_
from sqlmodel.ext.asyncio.session import AsyncSession
from app.models import PR, PRCreate, PRUpdate, Milestone, MilestoneRead, User

class UserRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_username(self, username: str) -> User | None:
        statement = select(User).where(User.username == username)
        result = await self.session.exec(statement)
        return result.first()

    async def create(self, user: User) -> User:
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        return user

class PRRepository:
    def __init__(self, session: AsyncSession, user_id: int):
        self.session = session
        self.user_id = user_id

    async def list_all(self) -> list[PR]:
        statement = select(PR).where(PR.user_id == self.user_id)
        result = await self.session.exec(statement)
        return list(result.all())

    async def get_by_id(self, id: int) -> PR | None:
        statement = select(PR).where(and_(PR.id == id, PR.user_id == self.user_id))
        result = await self.session.exec(statement)
        return result.first()

    async def create(self, data: PRCreate) -> PR:
        pr = PR(**data.model_dump(), user_id=self.user_id)
        self.session.add(pr)
        await self.session.flush()
        await self.sync_achievements(commit=False)
        await self.session.commit()
        await self.session.refresh(pr)
        return pr

    async def update(self, id: int, data: PRUpdate) -> PR | None:
        pr = await self.get_by_id(id)
        if not pr:
            return None
        
        pr_data = data.model_dump(exclude_unset=True)
        for key, value in pr_data.items():
            setattr(pr, key, value)
            
        self.session.add(pr)
        await self.session.flush()
        await self.sync_achievements(commit=False)
        await self.session.commit()
        await self.session.refresh(pr)
        return pr

    async def delete(self, id: int) -> bool:
        pr = await self.get_by_id(id)
        if not pr:
            return False
            
        await self.session.delete(pr)
        await self.session.flush()
        await self.sync_achievements(commit=False)
        await self.session.commit()
        return True

    async def get_milestones(self) -> list[MilestoneRead]:
        await self.sync_achievements(commit=True)
        
        statement_stats = select(
            func.count(PR.id).label("total_prs"),
            func.max(PR.weight).label("max_weight"),
            func.sum(PR.reps).label("total_reps")
        ).where(PR.user_id == self.user_id)
        stats_res = await self.session.execute(statement_stats)
        stats = stats_res.mappings().one()
        
        async def get_max(exercise_name: str, exclude: str = None):
            stmt = select(func.max(PR.weight)).where(
                and_(
                    PR.user_id == self.user_id,
                    func.lower(PR.exercise).contains(exercise_name.lower())
                )
            )
            if exclude:
                stmt = stmt.where(func.lower(PR.exercise).contains(exclude.lower()) == False)
            res = await self.session.execute(stmt)
            val = res.scalar()
            return float(val) if val is not None else 0.0

        defs = {
            "novice": {"title": "Novice Lifter", "desc": "Log your first Personal Record", "target": 1, "unit": "PR", "val": stats["total_prs"]},
            "gains": {"title": "Gains Seeker", "desc": "Log 5 Personal Records", "target": 5, "unit": "PRs", "val": stats["total_prs"]},
            "destroyer": {"title": "Destroyer of Weakness", "desc": "Log 10 Personal Records", "target": 10, "unit": "PRs", "val": stats["total_prs"]},
            "chest-pounder": {"title": "Chest Pounder", "desc": "Bench Press 100kg", "target": 100, "unit": "kg", "val": await get_max("bench press", "incline")},
            "squat-king": {"title": "The Squat King", "desc": "Squat 120kg", "target": 120, "unit": "kg", "val": await get_max("squat")},
            "earth-shaker": {"title": "Earth Shaker", "desc": "Deadlift 150kg", "target": 150, "unit": "kg", "val": await get_max("deadlift", "romanian")},
            "shoulder-titan": {"title": "Shoulder Titan", "desc": "Overhead Press 60kg", "target": 60, "unit": "kg", "val": await get_max("overhead press")},
            "wing-master": {"title": "Wing Master", "desc": "Weighted Pull Up 20kg", "target": 20, "unit": "kg", "val": await get_max("pull up")},
            "back-builder": {"title": "Back Builder", "desc": "Barbell Row 80kg", "target": 80, "unit": "kg", "val": await get_max("barbell row")},
            "incline-ace": {"title": "Incline Ace", "desc": "Incline Bench 90kg", "target": 90, "unit": "kg", "val": await get_max("incline bench")},
            "dip-demon": {"title": "Dip Demon", "desc": "Weighted Dips 40kg", "target": 40, "unit": "kg", "val": await get_max("dips")},
            "hinge-master": {"title": "Hinge Master", "desc": "Romanian Deadlift 100kg", "target": 100, "unit": "kg", "val": await get_max("romanian deadlift")},
            "leg-press-lord": {"title": "Leg Press Lord", "desc": "Leg Press 300kg", "target": 300, "unit": "kg", "val": await get_max("leg press")},
            "century": {"title": "Century Club", "desc": "Hit 100kg in any lift", "target": 100, "unit": "kg", "val": stats["max_weight"] or 0},
            "double-century": {"title": "Double Century", "desc": "Hit 200kg in any lift", "target": 200, "unit": "kg", "val": stats["max_weight"] or 0},
            "rep-king": {"title": "Rep King", "desc": "Log 100 total reps", "target": 100, "unit": "reps", "val": stats["total_reps"] or 0},
        }

        existing_res = await self.session.exec(select(Milestone).where(Milestone.user_id == self.user_id))
        unlocked = {m.name: m.unlocked_at for m in existing_res.all()}

        return [
            MilestoneRead(
                name=k,
                is_unlocked=k in unlocked,
                unlocked_at=unlocked.get(k),
                progress=float(min(v["val"], v["target"])),
                target=float(v["target"]),
                title=v["title"],
                description=v["desc"],
                unit=v["unit"]
            ) for k, v in defs.items()
        ]

    async def sync_achievements(self, commit: bool = True):
        stmt_stats = select(
            func.count(PR.id).label("total_prs"),
            func.max(PR.weight).label("max_weight"),
            func.sum(PR.reps).label("total_reps")
        ).where(PR.user_id == self.user_id)
        stats_res = await self.session.execute(stmt_stats)
        stats = stats_res.mappings().one()
        
        async def get_max(ex: str, exc: str = None):
            s = select(func.max(PR.weight)).where(
                and_(
                    PR.user_id == self.user_id,
                    func.lower(PR.exercise).contains(ex.lower())
                )
            )
            if exc: s = s.where(func.lower(PR.exercise).contains(exc.lower()) == False)
            res = await self.session.execute(s)
            return res.scalar() or 0

        conditions = {
            "novice": (stats["total_prs"] or 0) >= 1,
            "gains": (stats["total_prs"] or 0) >= 5,
            "destroyer": (stats["total_prs"] or 0) >= 10,
            "chest-pounder": (await get_max("bench press", "incline")) >= 100,
            "squat-king": (await get_max("squat")) >= 120,
            "earth-shaker": (await get_max("deadlift", "romanian")) >= 150,
            "shoulder-titan": (await get_max("overhead press")) >= 60,
            "wing-master": (await get_max("pull up")) >= 20,
            "back-builder": (await get_max("barbell row")) >= 80,
            "incline-ace": (await get_max("incline bench")) >= 90,
            "dip-demon": (await get_max("dips")) >= 40,
            "hinge-master": (await get_max("romanian deadlift")) >= 100,
            "leg-press-lord": (await get_max("leg press")) >= 300,
            "century": (stats["max_weight"] or 0) >= 100,
            "double-century": (stats["max_weight"] or 0) >= 200,
            "rep-king": (stats["total_reps"] or 0) >= 100,
        }

        existing_stmt = select(Milestone).where(Milestone.user_id == self.user_id)
        existing_res = await self.session.exec(existing_stmt)
        existing_milestones = existing_res.all()
        existing_map = {m.name: m for m in existing_milestones}

        for name, cond in conditions.items():
            if cond and name not in existing_map:
                self.session.add(Milestone(name=name, user_id=self.user_id))

        for name, milestone in existing_map.items():
            cond = conditions.get(name, False)
            if not cond:
                await self.session.delete(milestone)
        
        if commit:
            await self.session.commit()
        else:
            await self.session.flush()
