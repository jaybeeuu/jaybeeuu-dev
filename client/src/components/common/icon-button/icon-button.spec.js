import React from "react";
import { shallow } from "enzyme";
import "../../../../test/setup-enzyme";
import IconButton from "./icon-button";

describe("icon-button", () => {
  const getIconButton = ({
    className = "{prop_className}",
    icon = "{prop_icon}",
    onClick = jest.fn().mockName("{prop_onClick}")
  } = {}) => shallow(
    <IconButton
      className={className}
      icon={icon}
      onClick={onClick}
    />
  );

  const getEvent = () => ({
    id: "{event}",
    preventDefault: jest.fn().mockName("preventDefault")
  });

  it("calls the onClick function when the element is clicked.", () => {
    const onClick = jest.fn().mockName("{prop_onClick}");
    const iconButton = getIconButton({ onClick });
    const event = getEvent();
    iconButton.simulate("click", event);

    expect(onClick).toHaveBeenCalledWith(event);
  });

  it("calls the preventDefault on the event when the element is clicked.", () => {
    const onClick = jest.fn().mockName("{prop_onClick}");
    const iconButton = getIconButton({ onClick });
    const event = getEvent();
    iconButton.simulate("click", event);

    expect(event.preventDefault).toHaveBeenCalled();
  });

  it("renders the icon prop into a span.", () => {
    const icon = "{prop_icon}";
    const iconButton = getIconButton({ icon });

    const iconElement = iconButton.find(`.material-icons[children="${icon}"]`);

    expect(iconElement).not.toBeNull();
  });

  it("renders the className prop into the to level element.", () => {
    const className = "{prop_className}";
    const iconButton = getIconButton({ className });

    expect(iconButton.hasClass(className)).toBe(true);
  });
});