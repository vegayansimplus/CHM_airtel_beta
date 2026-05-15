import { api } from "../../../../../service/api";

type TaskDataFromApi = {
  crqValidation: boolean;
  employeeLevel: "L2" | "L3" | "L4";
  employeeName: string;
  impactAnalysis: boolean;
  mopCreation: boolean;
  mopValidation: boolean;
  networkExecution: boolean;
  olmId: string;
  schedulingApprovals: boolean;
};

export const taskConfigApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTaskConfigView: builder.query<TaskDataFromApi[], { subDomainId: number }>({
      query: ({ subDomainId }) => ({
        url: `/schedular/task-config?subDomainId=${subDomainId}`,
        method: "GET",
      }),
    }),
  }),
});

export const { useGetTaskConfigViewQuery } = taskConfigApi;
