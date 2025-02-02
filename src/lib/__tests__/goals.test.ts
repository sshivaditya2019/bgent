import { type User } from "@supabase/supabase-js";
import { type UUID } from "crypto";
import dotenv from "dotenv";
import { createRuntime } from "../../test/createRuntime";
import { createGoal, getGoals, updateGoal } from "../goals";
import { BgentRuntime } from "../runtime";
import { GoalStatus, type Goal } from "../types";

dotenv.config({ path: ".dev.vars" });
describe("Goals", () => {
  let runtime: BgentRuntime;
  let user: User;

  beforeAll(async () => {
    const result = await createRuntime({
      env: process.env as Record<string, string>,
    });
    runtime = result.runtime;
    user = result.session.user;
    await runtime.databaseAdapter.removeAllMemoriesByUserIds(
      [user.id as UUID],
      "goals",
    );
  });

  beforeEach(async () => {
    await runtime.databaseAdapter.removeAllMemoriesByUserIds(
      [user.id as UUID],
      "goals",
    );
  });

  afterAll(async () => {
    await runtime.databaseAdapter.removeAllMemoriesByUserIds(
      [user.id as UUID],
      "goals",
    );
  });

  // TODO: Write goal tests here
  test("createGoal - successfully creates a new goal", async () => {
    const newGoal: Goal = {
      name: "Test Create Goal",
      status: GoalStatus.IN_PROGRESS,
      user_ids: [user?.id as UUID],
      user_id: user?.id as UUID,
      objectives: [
        {
          description: "Test Objective",
          completed: false,
        },
      ],
    };

    await createGoal({
      runtime,
      goal: newGoal,
    });

    // Verify the goal is created in the database
    const goals = await getGoals({
      runtime,
      userIds: [user?.id as UUID],
      onlyInProgress: false,
    });
    const createdGoal = goals.find((goal: Goal) => goal.name === newGoal.name);

    expect(createdGoal).toBeDefined();
    expect(createdGoal?.status).toEqual("IN_PROGRESS");
    expect(createdGoal?.objectives.length).toBeGreaterThan(0);
  });

  // Updating an existing goal
  test("updateGoals - successfully updates an existing goal", async () => {
    const newGoal: Goal = {
      name: "Test Create Goal",
      status: GoalStatus.IN_PROGRESS,
      user_ids: [user?.id as UUID],
      user_id: user?.id as UUID,
      objectives: [
        {
          description: "Test Objective",
          completed: false,
        },
      ],
    };

    await createGoal({
      runtime,
      goal: newGoal,
    });

    // retrieve the goal from the database
    let goals = await getGoals({
      runtime,
      userIds: [user?.id as UUID],
      onlyInProgress: false,
    });
    const existingGoal = goals.find(
      (goal: Goal) => goal.name === newGoal.name,
    ) as Goal;
    const updatedGoal = { ...existingGoal, status: GoalStatus.DONE };
    await updateGoal({
      runtime,
      goal: updatedGoal,
    });

    // Verify the goal's status is updated in the database
    goals = await getGoals({
      runtime,
      userIds: [user?.id as UUID],
      onlyInProgress: false,
    });

    const updatedGoalInDb = goals.find(
      (goal: Goal) => goal.id === existingGoal.id,
    );

    expect(updatedGoalInDb?.status).toEqual(GoalStatus.DONE);
  });
});
