import { dbSla } from "./src/server/db-sla";

async function run() {
  const views = [
    {
      name: "report_application_manage",
      sql: "CREATE VIEW `report_application_manage` AS SELECT `a`.`name` AS `name`, `b`.`employee_number` AS `apc_sn`, concat(`b`.`name`,' ',`b`.`lastname`) AS `apc`, `c`.`employee_number` AS `apo_sn`, concat(`c`.`name`,' ',`c`.`lastname`) AS `apo` FROM ((`appc_det` `a` left join `user_details` `b` on((`a`.`apc_sn` = `b`.`username`))) left join `user_details` `c` on((`a`.`apo_sn` = `c`.`username`)))"
    },
    {
      name: "report_ccm_manage",
      sql: "CREATE VIEW `report_ccm_manage` AS SELECT `a`.`cost_centre` AS `cost_centre`, `a`.`cost_centre_name` AS `cost_centre_name`, concat(`b`.`name`,' ',`b`.`lastname`) AS `ccm_name`, `b`.`employee_number` AS `employee_number` FROM (`api_tab` `a` left join `user_details` `b` on((`a`.`cost_centre_manager_sn` = `b`.`username`)))"
    },
    {
      name: "report_hod_manage",
      sql: "CREATE VIEW `report_hod_manage` AS SELECT concat(`a`.`hod_first`,' ',`a`.`hod_last`) AS `hod_name`, `a`.`division` AS `division`, `b`.`employee_number` AS `employee_number` FROM (`division` `a` left join `user_details` `b` on((`a`.`hod` = `b`.`username`)))"
    },
    {
      name: "report_itbsm_manage",
      sql: "CREATE VIEW `report_itbsm_manage` AS SELECT `a`.`division` AS `division`, `a`.`department` AS `department`, concat(`a`.`name`,' ',`a`.`lastname`) AS `service_owner`, `b`.`employee_number` AS `employee_number` FROM (`itbsm_dep` `a` left join `user_details` `b` on((`a`.`itbsm` = `b`.`username`)))"
    },
    {
      name: "report_mitbsm_manage",
      sql: "CREATE VIEW `report_mitbsm_manage` AS SELECT concat(`a`.`name`,' ',`a`.`lastname`) AS `name`, `a`.`division` AS `division`, `b`.`employee_number` AS `employee_number` FROM (`mitbs_division` `a` left join `user_details` `b` on((`a`.`mitbsm` = `b`.`username`)))"
    },
    {
      name: "report_single_role",
      sql: "CREATE VIEW `report_single_role` AS SELECT `a`.`long_name` AS `long_name`, concat(`a`.`name`,' ',`a`.`lastname`) AS `name`, `b`.`employee_number` AS `employee_number` FROM (`single_role` `a` left join `user_details` `b` on((`a`.`user_id` = `b`.`id`)))"
    }
  ];

  try {
    for (const view of views) {
      console.log(`Checking view: ${view.name}`);
      try {
        await dbSla.query(`DROP TABLE IF EXISTS \`${view.name}\``);
      } catch(e) {}
      try {
        await dbSla.query(`DROP VIEW IF EXISTS \`${view.name}\``);
      } catch(e) {}
      
      await dbSla.query(view.sql);
      console.log(`Successfully created view: ${view.name}`);
    }
    console.log("All views created successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error creating views:", error);
    process.exit(1);
  }
}

run();
