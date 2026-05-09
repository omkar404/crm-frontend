import { BrowserRouter, Routes } from "react-router-dom";

import { getCrmRoutes } from "@/modules/crm/routes";
import { getWorkdeskRoutes } from "@/modules/workdesk/routes";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {getCrmRoutes()}
        {getWorkdeskRoutes()}
      </Routes>
    </BrowserRouter>
  );
}
