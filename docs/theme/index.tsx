import { HomeLayout as BasicHomeLayout } from "@rspress/core/theme-original";
import PackageInstall from "../components/PackageInstall";

import "./index.css";

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
    afterHero={
      <div
        style={{
          maxWidth: "72rem",
          margin: "-3rem auto",
          marginBottom: "4rem",
          borderRadius: "var(--rp-radius)",
          overflow: "hidden",
        }}
      >
        <img src="/show.gif" />
      </div>
    }
  />
);

export { HomeLayout };

export * from "@rspress/core/theme-original";
