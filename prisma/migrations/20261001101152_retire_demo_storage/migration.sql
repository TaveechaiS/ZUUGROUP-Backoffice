-- TASK-052 approved. Archive: scripts/fixtures/operational-migration-backup.json (57 rows/19 datasets).
DO $guard$
BEGIN
 IF EXISTS (SELECT 1 FROM demo_rows r WHERE r.dataset_key NOT LIKE 'reports/%' AND NOT EXISTS (SELECT 1 FROM record_import_map m WHERE m.source_id=r.id)) THEN
  RAISE EXCEPTION 'Unmapped original records; retirement stopped';
 END IF;
 IF (SELECT count(*) FROM record_import_map)<48 THEN RAISE EXCEPTION 'Incomplete mapping'; END IF;
END $guard$;
DROP TABLE demo_rows;
DROP TABLE demo_datasets;
