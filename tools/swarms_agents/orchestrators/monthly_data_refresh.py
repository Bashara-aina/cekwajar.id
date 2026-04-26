import asyncio
import sys
import os
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from agents.base_agent import get_supabase

supabase = get_supabase()


async def run_monthly_pipeline():
    start_time = datetime.now()
    log_id = None

    try:
        result = supabase.table("pipeline_runs").insert(
            {
                "pipeline_name": "monthly_full_refresh",
                "status": "running",
                "started_at": start_time.isoformat(),
            }
        ).execute()
        log_id = result.data[0]["id"]
    except Exception as e:
        print(f"Warning: Could not insert pipeline log: {e}")

    steps_completed = []
    errors = []

    print("=" * 50)
    print("CEKWAJAR MONTHLY DATA PIPELINE")
    print("=" * 50)

    steps_completed.append("pipeline_initialized")

    end_time = datetime.now()
    duration_minutes = (end_time - start_time).seconds / 60

    if log_id:
        try:
            supabase.table("pipeline_runs").update(
                {
                    "status": "completed_with_notes",
                    "completed_at": end_time.isoformat(),
                    "duration_minutes": round(duration_minutes, 1),
                    "steps_completed": steps_completed,
                    "errors": errors if errors else None,
                }
            ).eq("id", log_id).execute()
        except Exception as e:
            print(f"Warning: Could not update pipeline log: {e}")

    print(f"Completed in {round(duration_minutes, 1)} minutes")
    return {"status": "completed", "duration_minutes": round(duration_minutes, 1)}


if __name__ == "__main__":
    result = asyncio.run(run_monthly_pipeline())
    print(f"Result: {result}")