import type { GlobalProvider } from "@ladle/react"
import { name, repository } from "../package.json"

export const Provider: GlobalProvider = ({ children, globalState }) => (
  <>
    <h1 style={{ textTransform: "uppercase", fontSize: "1.5rem" }}>
      {name}{" "}
      <a
        href={repository.url}
        target="_blank"
        style={{
          fontSize: "1rem",
          textDecoration: "underline",
        }}
      >
        Github
      </a>
    </h1>
    {children}
  </>
)
