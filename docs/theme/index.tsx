import { HomeLayout as BasicHomeLayout } from "@rspress/core/theme-original";
import PackageInstall from "../components/PackageInstall";

const HomeLayout = () => (
  <BasicHomeLayout
    afterHeroActions={
      <div
        className="rp-doc"
        style={{ width: "100%", maxWidth: 450, margin: "-1rem 0" }}
      >
        <PackageInstall />
      </div>
    }
  />
);

export { HomeLayout };

export * from "@rspress/core/theme-original";
