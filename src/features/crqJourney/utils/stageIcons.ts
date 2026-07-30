import type { ElementType } from "react";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import RocketLaunchRoundedIcon from "@mui/icons-material/RocketLaunchRounded";
import FlagRoundedIcon from "@mui/icons-material/FlagRounded";

/** get_crq_details stage codes → representative icon. Shared by the list and visual-flow views. */
export const STAGE_ICONS: Record<string, ElementType> = {
  VALIDATE: FactCheckRoundedIcon,
  IMPACT_ANALYSIS: InsightsRoundedIcon,
  MOP_CREATION: DescriptionRoundedIcon,
  MOP_VALIDATION: VerifiedRoundedIcon,
  SCHEDULING_APPROVAL: EventAvailableRoundedIcon,
  EXECUTION: RocketLaunchRoundedIcon,
  CLOSURE: FlagRoundedIcon,
};

export const getStageIcon = (code: string): ElementType => STAGE_ICONS[code.trim().toUpperCase()] ?? FactCheckRoundedIcon;
