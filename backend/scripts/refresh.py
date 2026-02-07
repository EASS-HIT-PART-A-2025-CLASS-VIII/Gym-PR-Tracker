import asyncio
import os
import random
import logging
from redis.asyncio import Redis

# Setup basic logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- Configuration ---
# REDIS_URL for idempotency checks
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

# CONCURRENCY_LIMIT: We use a Semaphore to limit how many users we process at once.
# This prevents overwhelming the database or external APIs when processing thousands of records.
CONCURRENCY_LIMIT = 5

# --- Clients ---
# Initialize Redis client (async)
redis_client = Redis.from_url(REDIS_URL, decode_responses=True)

async def refresh_user_data(user_id: int):
    """
    Simulated function to refresh data for a single user.
    In a real app, this might fetch new workout data from a wearable API
    or recalculate fitness stats based on recent PRs.
    """
    
    # --- Idempotency Check (Redis) ---
    # We use SET with NX (Not Exists) and EX (Expire) to ensure we don't process
    # the same user twice within a short window (e.g., 60 seconds).
    # If the key is set successfully, it returns True. If checks fail (key exists), it returns None.
    lock_key = f"refresh_lock:user:{user_id}"
    is_locked = await redis_client.set(lock_key, "locked", nx=True, ex=60)
    
    if not is_locked:
        logger.info(f"Skipping user {user_id}: Already being processed (Idempotency).")
        return

    # --- Retry Logic ---
    # We wrap the core logic in a retry loop to handle transient failures (network blips, timeouts).
    # We attempt up to 3 times with exponential backoff.
    max_retries = 3
    for attempt in range(1, max_retries + 1):
        try:
            logger.info(f"Processing user {user_id} (Attempt {attempt}/{max_retries})...")
            
            # Simulate network IO or computation
            await asyncio.sleep(random.uniform(0.5, 1.5))
            
            # Simulate a random failure to demonstrate retries (20% chance)
            if random.random() < 0.2:
                raise Exception("Simulated network failure")
            
            # Success!
            logger.info(f"Successfully refreshed data for user {user_id}.")
            return

        except Exception as e:
            logger.warning(f"Error refreshing user {user_id}: {e}")
            if attempt < max_retries:
                # Exponential backoff: fast updates, slow retries
                # wait 1s, then 2s, etc.
                wait_time = attempt * 1.0
                logger.info(f"Retrying user {user_id} in {wait_time}s...")
                await asyncio.sleep(wait_time)
            else:
                logger.error(f"Failed to refresh user {user_id} after {max_retries} attempts.")

async def main():
    logger.info("Starting Async Refresher Job...")

    # Simulated list of user IDs to process
    user_ids = range(1, 21) # Users 1 to 20

    # --- Bounded Concurrency (Semaphore) ---
    # We create a Semaphore with a limit (CONCURRENCY_LIMIT=5).
    # This acts as a gatekeeper: only 5 workers can enter the "critical section" at once.
    sem = asyncio.Semaphore(CONCURRENCY_LIMIT)

    async def worker(uid):
        # The 'async with sem:' block ensures we acquire a permit before entering
        # and release it automatically when exiting.
        async with sem:
            await refresh_user_data(uid)

    # storage for all the background tasks
    tasks = []
    
    for uid in user_ids:
        # Create a task for each user, but execution is throttled by the semaphore inside 'worker'
        task = asyncio.create_task(worker(uid))
        tasks.append(task)

    # Wait for all tasks to complete
    await asyncio.gather(*tasks)
    
    logger.info("Async Refresher Job Completed.")

if __name__ == "__main__":
    # Run the main async loop
    asyncio.run(main())
