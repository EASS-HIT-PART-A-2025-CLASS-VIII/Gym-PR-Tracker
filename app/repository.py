from sqlmodel import Session, select
from .models import PR, PRCreate, PRUpdate
from .database import engine 

class PRRepository:

    def create(self, pr_data: PRCreate) -> PR:
        with Session(engine) as session:
            db_pr = PR.model_validate(pr_data)
            session.add(db_pr)
            session.commit()
            session.refresh(db_pr) 
            return db_pr

    def list_all(self) -> list[PR]:
        with Session(engine) as session:
            statement = select(PR)
            results = session.exec(statement)
            return list(results.all())

    def get_by_id(self, pr_id: int) -> PR | None:
        with Session(engine) as session:
            return session.get(PR, pr_id)

    def delete(self, pr_id: int) -> bool:
        with Session(engine) as session:
            pr = session.get(PR, pr_id)
            if not pr:
                return False
            session.delete(pr)
            session.commit()
            return True

    def update(self, pr_id: int, pr_update: PRUpdate) -> PR | None:
        with Session(engine) as session:
            db_pr = session.get(PR, pr_id)
            if not db_pr:
                return None
            
            pr_data = pr_update.model_dump(exclude_unset=True)
            for key, value in pr_data.items():
                if value is not None:
                    setattr(db_pr, key, value)
            
            session.add(db_pr)
            session.commit()
            session.refresh(db_pr)
            return db_pr        