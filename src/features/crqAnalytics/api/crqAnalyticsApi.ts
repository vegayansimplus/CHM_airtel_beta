import { api } from "../../../service/api";
import type {
  CRQAnalyticsFilterParams,
  CRQAnalyticsDashboardResponse,
  CRQOpenDomainDto,
  CRQRaisedVsClosedDto,
  CRQRunRateDto,
  CRQGroupBreakdownDto,
  GroupBreakdownDimension,
  CRQListParams,
  CRQListResponseDto,
  AgingHeatmapParams,
  AgingHeatmapResponseDto,
  AnalyticsReportType,
  AvailableDatesResponse,
  AvailableReportsResponse,
  DownloadReportArgs,
} from "../types/crqAnalytics.types";

const filterParams = (f: CRQAnalyticsFilterParams) => ({
  verticalId: f.verticalId,
  teamFunctionId: f.teamFunctionId,
  domainId: f.domainId,
  subDomainId: f.subDomainId,
  circleId: f.circleId,
  startDate: f.startDate,
  endDate: f.endDate,
});

export const crqAnalyticsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Master aggregate — KPIs + workflow stages + SLA domains + rejection
    // reasons + engineer utilization in one call, backs the Dashboard tab.
    getCrqAnalyticsDashboard: builder.query<CRQAnalyticsDashboardResponse, CRQAnalyticsFilterParams>({
      query: (f) => ({ url: "/crq-analytics/dashboard", params: filterParams(f) }),
      providesTags: ["CrqAnalytics"],
    }),

    getCrqOpenDomain: builder.query<CRQOpenDomainDto[], CRQAnalyticsFilterParams>({
      query: (f) => ({ url: "/crq-analytics/open-domain", params: filterParams(f) }),
      providesTags: ["CrqAnalytics"],
    }),

    getCrqRaisedVsClosed: builder.query<CRQRaisedVsClosedDto[], CRQAnalyticsFilterParams>({
      query: (f) => ({ url: "/crq-analytics/raised-vs-closed", params: filterParams(f) }),
      providesTags: ["CrqAnalytics"],
    }),

    getCrqRunRate: builder.query<CRQRunRateDto[], CRQAnalyticsFilterParams>({
      query: (f) => ({ url: "/crq-analytics/run-rate", params: filterParams(f) }),
      providesTags: ["CrqAnalytics"],
    }),

    getCrqGroupBreakdown: builder.query<
      CRQGroupBreakdownDto[],
      CRQAnalyticsFilterParams & { groupBy: GroupBreakdownDimension }
    >({
      query: ({ groupBy, ...f }) => ({
        url: "/crq-analytics/group-breakdown",
        params: { ...filterParams(f), groupBy },
      }),
      providesTags: ["CrqAnalytics"],
    }),

    // Not on crqanalytic — the only aging-heatmap data source is the older,
    // otherwise-unrelated crqdashboard package. Cross-package reuse, see plan.
    getCrqAgingHeatmap: builder.query<AgingHeatmapResponseDto, AgingHeatmapParams>({
      query: ({ heatmapMode, ...f }) => ({
        url: "/crq/agingheatmap",
        params: { ...filterParams(f), heatmapMode },
      }),
      providesTags: ["CrqAnalytics"],
    }),

    getCrqAnalyticsList: builder.query<CRQListResponseDto, CRQListParams>({
      query: ({ status, stage, page, size, ...f }) => ({
        url: "/crq-analytics/crqs",
        params: { ...filterParams(f), status, stage, page, size },
      }),
      providesTags: ["CrqAnalytics"],
    }),

    getAnalyticsReportDates: builder.query<AvailableDatesResponse, AnalyticsReportType>({
      query: (reportType) => `/analytics/reports/${reportType}`,
    }),

    getAnalyticsReportsForDate: builder.query<
      AvailableReportsResponse,
      { reportType: AnalyticsReportType; date: string }
    >({
      query: ({ reportType, date }) => `/analytics/reports/${reportType}/${date}`,
    }),

    downloadAnalyticsReport: builder.query<Blob, DownloadReportArgs>({
      query: ({ reportType, date, fileName }) => ({
        url: `/analytics/reports/${reportType}/${date}/download/${fileName}`,
        method: "GET",
        responseHandler: (response: Response) => response.blob(),
        cache: "no-cache",
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCrqAnalyticsDashboardQuery,
  useGetCrqOpenDomainQuery,
  useGetCrqRaisedVsClosedQuery,
  useGetCrqRunRateQuery,
  useGetCrqGroupBreakdownQuery,
  useGetCrqAgingHeatmapQuery,
  useGetCrqAnalyticsListQuery,
  useGetAnalyticsReportDatesQuery,
  useGetAnalyticsReportsForDateQuery,
  useLazyDownloadAnalyticsReportQuery,
} = crqAnalyticsApi;
