# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - 2025-12-01

### Backend Logic
- **Controllers**:
  - `testResultsController.js`: Added `getTestResultsByAthlete` to fetch test results grouped by exercise for a specific athlete.

## [Unreleased] - 2025-11-26

### Data Updates
- **Seed Data**:
  - Added "Inverted Row" exercise via script (`insert_inverted_row.js`).

## [Unreleased] - 2025-11-25

### Database Changes
- **New Table**: `equipment`
  - Stores equipment items (e.g., "Dumbbells", "Barbell").
  - Columns: `id`, `naziv`, `opis`.
- **New Table**: `exercise_equipment`
  - Many-to-many relationship between exercises and equipment.
  - Columns: `id`, `exercise_id` (FK -> exercises), `equipment_id` (FK -> equipment).
- **New Table**: `muscle_sub_groups`
  - Stores sub-groups for muscle groups (e.g., "Upper Chest" for "Chest").
  - Columns: `id`, `muscle_group_id` (FK -> muscle_groups), `naziv`, `opis`.
- **New Table**: `exercise_muscle_groups`
  - Replaces the old single-column relationship in `exercises`.
  - Supports multiple muscle groups per exercise with activation types.
  - Columns: `id`, `exercise_id` (FK -> exercises), `muscle_group_id` (FK -> muscle_groups), `muscle_sub_group_id` (FK -> muscle_sub_groups, nullable), `activation_type` (Enum: 'Glavni (primarni)', 'Pomoćni (sekundarni)', 'Stabilizatori').
- **Table Modified**: `exercises`
  - Removed columns: `muscle_group_id`, `other_muscle_group_id`, `oprema`.
  - Data migrated to new tables.

### Backend Logic
- **New Routes**:
  - `/api/equipment`: CRUD for equipment.
  - `/api/muscle-sub-groups`: CRUD for muscle sub-groups.
- **Updated Routes**:
  - `/api/exercises`: Updated to handle fetching and saving complex relationships (equipment, multiple muscle groups/sub-groups).
- **Models**:
  - `equipmentModel.js`: New model.
  - `muscleSubGroupModel.js`: New model.
  - `exerciseModel.js`: Updated to join with new tables and handle transaction-based inserts/updates.
- **Controllers**:
  - `equipmentController.js`: New controller.
  - `muscleSubGroupController.js`: New controller.
  - `exerciseController.js`: Updated to process JSON arrays for equipment and muscle groups.

## [Unreleased] - 2025-11-23

### Database Changes
- **New Table**: `training_plans`
  - Created to group training sessions into a logical plan (e.g., "Hypertrophy Phase 1").
  - Columns: `id`, `name`, `description`, `created_by` (FK -> users), `created_at`.
- **Table Modified**: `training_schedules`
  - Added column: `training_plan_id` (FK -> training_plans).
  - Modified column: `program_id` is now nullable (schedules can belong to a plan instead of a program).

### Backend Logic
- **New Routes**: `/api/training-plans`
  - `POST /`: Create a new training plan with associated schedules and assignments.
  - `GET /`: List all training plans.
- **Models**:
  - `TrainingPlan.js`: New model for managing training plans.
- **Controllers**:
  - `trainingPlanController.js`: Handles creation of plans, including bulk creation of schedules and assignments (groups/athletes).

## [Unreleased] - 2025-11-21

### Database Changes
- **New Table**: `tests`
  - Stores test definitions created by coaches.
  - Columns: `id`, `naziv`, `datum`, `trener_id` (FK -> trainers), `napomena`, `created_at`.
- **New Table**: `test_exercises`
  - Links exercises to a specific test with input type definitions.
  - Columns: `id`, `test_id` (FK -> tests), `exercises_id` (FK -> exercises), `vrsta_unosa` (enum).
- **New Table**: `test_results`
  - Stores the result header for an athlete for a specific test exercise.
  - Columns: `id`, `athlete_id` (FK -> athletes), `test_exercises_id` (FK -> test_exercises), `napomena`.
- **New Table**: `test_results_values`
  - Stores the actual values (sets/reps/time) for a test result.
  - Columns: `id`, `test_result_id` (FK -> test_results), `vrsta_rezultata_1`, `rezultat_1`, `jedinica_mere_1`, etc.

### Backend Logic
- **New Routes**:
  - `/api/tests`: CRUD for tests.
  - `/api/test-exercises`: Manage exercises within a test.
  - `/api/test-results`: Record and retrieve results.
- **Controllers**:
  - `testsController.js`: Main logic for tests.
  - `testExercisesController.js`: Logic for test exercises.
  - `testResultsController.js`: Logic for recording results.

## [Unreleased] - 2025-11-22

### Database Changes
- **New Table**: `training_schedules`
  - Created to decouple training templates from specific sessions.
  - Columns: `id` (PK), `training_id` (FK -> trainings), `datum`, `vreme`, `location_id` (FK -> locations), `created_at`.
- **Table Modified**: `training_attendance`
  - Added column: `training_schedule_id` (FK -> training_schedules).
  - Removed column: `training_id`.
  - *Migration*: Existing attendance records were migrated to link to the new schedule records.
- **Table Modified**: `trainings`
  - Removed columns: `datum`, `vreme`, `location_id`.
  - *Note*: The `trainings` table now serves as a template definition (exercises, description) rather than a specific scheduled event.

### Backend Logic
- **New Routes**: `/api/schedules` for managing training schedules (CRUD).
- **Updated Routes**:
  - `/api/schedules/:id/attendance` (GET/POST) replaces the old `/api/trainings/:id/attendance` routes.
- **Models**:
  - `trainingModel.js`: Updated to handle trainings as templates (removed date/location logic).
  - `attendanceModel.js`: Updated to fetch and save attendance based on `training_schedule_id`.
  - `trainingScheduleModel.js`: Created to handle schedule logic.
