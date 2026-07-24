import { api } from "../../../../../service/api";
import type { AttributeUpdateDetailsResponse } from "../types/attributeUpdate.types";

export interface AttributeUpdateSaveSection {
  [field: string]: string | null | undefined;
}

export interface AttributeUpdateSavePayload {
  crqNo: string;
  /** CRQ_MASTER_TBL.current_stage enum value, e.g. "IMPACT_ANALYSIS". */
  cmsStage: string;
  remedy?: AttributeUpdateSaveSection;
  cab?: AttributeUpdateSaveSection;
  cygnet?: AttributeUpdateSaveSection;
}

export const attributeUpdateApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    // GET /attributeupdate/details?crqNo=&cmsStage= - latest saved Remedy /
    // CAB / Cygnet snapshot for this CRQ at this stage, one round trip.
    getAttributeUpdateDetails: builder.query<
      AttributeUpdateDetailsResponse,
      { crqNo: string; cmsStage: string }
    >({
      query: ({ crqNo, cmsStage }) => ({
        url: "/attributeupdate/details",
        method: "GET",
        params: { crqNo, cmsStage },
      }),
      providesTags: ["AttributeUpdate"],
    }),

    // POST /attributeupdate/save - saves whichever of remedy/cab/cygnet the
    // caller includes for the current stage.
    saveAttributeUpdate: builder.mutation<
      { status?: string; message?: string },
      AttributeUpdateSavePayload
    >({
      query: (payload) => ({
        url: "/attributeupdate/save",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["AttributeUpdate"],
    }),
  }),
});

export const {
  useGetAttributeUpdateDetailsQuery,
  useSaveAttributeUpdateMutation,
} = attributeUpdateApiSlice;
