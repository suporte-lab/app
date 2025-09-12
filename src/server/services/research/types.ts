import { DB } from "@/server/db/types";
import { Selectable } from "kysely";

export type ResearchDTO = Selectable<DB["research"]>;
export type SurveyDTO = Selectable<DB["survey"]>;
export type SurveyQuestionDTO = Selectable<DB["surveyQuestion"]>;
export type SurveyQuestionMetadataDTO = Selectable<
  DB["surveyQuestionMetadata"]
>;
export type SurveyAnswerDTO = Selectable<DB["surveyAnswer"]>;
