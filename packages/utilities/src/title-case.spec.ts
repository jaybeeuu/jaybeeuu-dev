import { titleCase } from "./title-case";

describe("titleCase", () => {
  it("titles the case of a kebab-case String.", () => {
    expect(titleCase("kebab-case")).toBe("Kebab Case");
  });

  it("titles the case of a kebab-case String with many kebabs.", () => {
    expect(titleCase("kebab-case-kebab-case")).toBe("Kebab Case Kebab Case");
  });

  it("leaves unkebab case test unchanged.", () => {
    expect(titleCase("not kebab case")).toBe("Not kebab case");
  });
});
