from datetime import datetime
from models import PR, PRCreate, PRUpdate

class PRRepository:
    def __init__(self):
        # In-memory storage: {id: PR_Object}
        self.storage: dict[int, PR] = {}
        self.current_id = 1

    def create(self, pr_data: PRCreate) -> PR:
        new_pr = PR(
            id=self.current_id,
            performed_at=datetime.now(),
            **pr_data.model_dump()
        )
        self.storage[self.current_id] = new_pr
        self.current_id += 1
        return new_pr

    def list_all(self) -> list[PR]:
        return list(self.storage.values())

    def get_by_id(self, pr_id: int) -> PR | None:
        return self.storage.get(pr_id)

    def update(self, pr_id: int, update_data: PRUpdate) -> PR | None:
        if pr_id not in self.storage:
            return None
        
        current_pr = self.storage[pr_id]
        # Smart update: only changes fields that were actually sent
        updated_data = current_pr.model_copy(
            update=update_data.model_dump(exclude_unset=True)
        )
        
        self.storage[pr_id] = updated_data
        return updated_data

    def delete(self, pr_id: int) -> bool:
        if pr_id in self.storage:
            del self.storage[pr_id]
            return True
        return False