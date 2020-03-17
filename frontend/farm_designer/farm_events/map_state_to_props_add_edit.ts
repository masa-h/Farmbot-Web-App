import { AddEditFarmEventProps } from "../interfaces";
import { Everything, TimeSettings } from "../../interfaces";
import moment from "moment";
import { history, getPathArray } from "../../history";
import {
  selectAllFarmEvents,
  indexRegimenById,
  indexSequenceById,
  indexFarmEventById,
  findFarmEventById,
  selectAllRegimens,
  selectAllSequences,
  findSequenceById,
  findRegimenById,
  getDeviceAccountSettings,
  maybeGetTimeSettings,
} from "../../resources/selectors";
import {
  TaggedFarmEvent,
  TaggedSequence,
  TaggedRegimen,
} from "farmbot";
import { DropDownItem } from "../../ui/index";
import { validFbosConfig } from "../../util";
import {
  sourceFbosConfigValue,
} from "../../devices/components/source_config_value";
import { hasId } from "../../resources/util";
import { ExecutableType } from "farmbot/dist/resources/api_resources";
import { getFbosConfig } from "../../resources/getters";
import { t } from "../../i18next_wrapper";
import { getShouldDisplayFn } from "../../farmware/state_to_props";

export const formatTime = (input: string, timeSettings: TimeSettings) => {
  const iso = new Date(input).toISOString();
  return moment(iso).utcOffset(timeSettings.utcOffset).format("HH:mm");
};

export const formatDate = (input: string, timeSettings: TimeSettings) => {
  const iso = new Date(input).toISOString();
  return moment(iso).utcOffset(timeSettings.utcOffset).format("YYYY-MM-DD");
};

export const repeatOptions = [
  { label: t("Minutes"), value: "minutely", name: "time_unit" },
  { label: t("Hours"), value: "hourly", name: "time_unit" },
  { label: t("Days"), value: "daily", name: "time_unit" },
  { label: t("Weeks"), value: "weekly", name: "time_unit" },
  { label: t("Months"), value: "monthly", name: "time_unit" },
  { label: t("Years"), value: "yearly", name: "time_unit" },
];

const handleTime = (
  e: React.SyntheticEvent<HTMLInputElement>,
  currentISO: string,
) => {
  const incomingTime = e.currentTarget.value.split(":");
  const hours = parseInt(incomingTime[0]) || 0;
  const minutes = parseInt(incomingTime[1]) || 0;

  switch (e.currentTarget.name) {
    case "start_time":
      // Put the current ISO established by the date field into a var
      const currentStartISO = new Date((currentISO || "").toString())
        .toISOString();

      // Set the time of the already existing iso string
      const newStartISO = moment(currentStartISO)
        .set("hours", hours)
        .set("minutes", minutes)
        .toISOString();

      return newStartISO;

    case "end_time":
      const currentEndISO = new Date((currentISO || "").toString())
        .toISOString();

      const newEndISO = moment(currentEndISO)
        .set("hours", hours)
        .set("minutes", minutes)
        .toISOString();

      return newEndISO;

    default:
      throw new Error("Expected a name attribute from time field.");
  }
};

const addExecutables =
  (resource: (TaggedSequence | TaggedRegimen)[]): DropDownItem[] => {
    const d: DropDownItem[] = [];
    resource.map(r => {
      if (r.body.id) {
        d.push({ label: r.body.name, headingId: r.kind, value: r.body.id });
      }
    });
    return d;
  };

export function mapStateToPropsAddEdit(props: Everything): AddEditFarmEventProps {
  const executableList: DropDownItem[] = [
    { label: t("Sequences"), heading: true, value: 0, headingId: "Sequence" },
    ...addExecutables(selectAllSequences(props.resources.index)),
    { label: t("Regimens"), heading: true, value: 0, headingId: "Regimen" },
    ...addExecutables(selectAllRegimens(props.resources.index)),
  ];

  const regimensById = indexRegimenById(props.resources.index);
  const sequencesById = indexSequenceById(props.resources.index);
  const farmEventsById = indexFarmEventById(props.resources.index);
  const farmEvents = selectAllFarmEvents(props.resources.index);
  const findFarmEventByUuid =
    (uuid: string | undefined): TaggedFarmEvent | undefined =>
      uuid ? farmEvents.filter(x => x.uuid === uuid)[0] : undefined;

  const getFarmEvent = (): TaggedFarmEvent | undefined => {
    const id = parseInt(getPathArray()[4]);
    if (id && hasId(props.resources.index, "FarmEvent", id)) {
      return findFarmEventById(props.resources.index, id);
    } else {
      history.push("/app/designer/events");
    }
  };

  const findExecutable = (kind: ExecutableType, id: number):
    TaggedSequence | TaggedRegimen => {
    switch (kind) {
      case "Sequence": return findSequenceById(props.resources.index, id);
      case "Regimen": return findRegimenById(props.resources.index, id);
    }
  };
  const dev = getDeviceAccountSettings(props.resources.index);

  const { configuration } = props.bot.hardware;
  const fbosConfig = validFbosConfig(getFbosConfig(props.resources.index));
  const autoSyncEnabled =
    !!sourceFbosConfigValue(fbosConfig, configuration)("auto_sync").value;

  return {
    deviceTimezone: dev
      .body
      .timezone,
    dispatch: props.dispatch,
    regimensById,
    sequencesById,
    farmEventsById,
    executableOptions: executableList,
    repeatOptions,
    handleTime,
    farmEvents,
    getFarmEvent,
    findFarmEventByUuid,
    findExecutable,
    timeSettings: maybeGetTimeSettings(props.resources.index),
    autoSyncEnabled,
    resources: props.resources.index,
    shouldDisplay: getShouldDisplayFn(props.resources.index, props.bot),
  };
}
