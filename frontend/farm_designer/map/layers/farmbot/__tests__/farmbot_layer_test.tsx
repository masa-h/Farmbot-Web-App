import * as React from "react";
import { FarmBotLayer } from "../farmbot_layer";
import { shallow } from "enzyme";
import { FarmBotLayerProps } from "../../../interfaces";
import {
  fakeMapTransformProps,
} from "../../../../../__test_support__/map_transform_props";
import {
  fakeMountedToolInfo,
} from "../../../../../__test_support__/fake_tool_info";
import {
  fakeCameraCalibrationData,
} from "../../../../../__test_support__/fake_camera_data";

describe("<FarmBotLayer/>", () => {
  function fakeProps(): FarmBotLayerProps {
    return {
      visible: true,
      botLocationData: {
        position: { x: undefined, y: undefined, z: undefined },
        scaled_encoders: { x: undefined, y: undefined, z: undefined },
        raw_encoders: { x: undefined, y: undefined, z: undefined },
      },
      mapTransformProps: fakeMapTransformProps(),
      stopAtHome: { x: true, y: true },
      botSize: {
        x: { value: 3000, isDefault: true },
        y: { value: 1500, isDefault: true }
      },
      plantAreaOffset: { x: 100, y: 100 },
      peripherals: [],
      eStopStatus: false,
      getConfigValue: jest.fn(),
      mountedToolInfo: fakeMountedToolInfo(),
      cameraCalibrationData: fakeCameraCalibrationData(),
    };
  }

  it("shows layer elements", () => {
    const p = fakeProps();
    const result = shallow(<FarmBotLayer {...p} />);
    const layer = result.find("#farmbot-layer");
    expect(layer.find("#virtual-farmbot")).toBeTruthy();
    expect(layer.find("#extents")).toBeTruthy();
  });

  it("toggles visibility off", () => {
    const p = fakeProps();
    p.visible = false;
    const result = shallow(<FarmBotLayer {...p} />);
    expect(result.html()).toEqual("<g id=\"farmbot-layer\"></g>");
  });
});
