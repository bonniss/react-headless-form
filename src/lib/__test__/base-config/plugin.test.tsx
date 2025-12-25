import BlueForm from "@/components/form/BlueForm"
import { devToolPlugin } from "@/components/plugins/devtool"
import { fireEvent, screen, waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { renderWithBlueFormProvider } from "../_utils/render-form"

const TestRoot = ({ children, onSubmit }: any) => (
  <form onSubmit={onSubmit}>{children}</form>
)

describe("BlueForm – plugins", () => {
  it("renders plugin output", () => {
    const plugin = {
      name: "test-plugin",
      render: () => <div data-testid="plugin-node" />,
    }

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        plugins={[plugin]}
        config={{
          // empty is ok if your engine allows it; if not, keep a ui/inline placeholder
          _ui: {
            type: "ui",
            props: { config: {} },
          } as any,
        }}
      />
    )

    expect(screen.getByTestId("plugin-node")).toBeDefined()
  })

  it("passes form methods into plugin render()", () => {
    const plugin = {
      name: "form-access",
      render: (form: any) => (
        <div data-testid="has-control">{String(Boolean(form?.control))}</div>
      ),
    }

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        plugins={[plugin]}
        config={{
          _ui: { type: "ui", props: { config: {} } } as any,
        }}
      />
    )

    expect(screen.getByTestId("has-control").textContent).toBe("true")
  })

  it("renders multiple plugins in order", () => {
    const plugins = [
      { name: "p1", render: () => <div data-testid="p">1</div> },
      { name: "p2", render: () => <div data-testid="p">2</div> },
      { name: "p3", render: () => <div data-testid="p">3</div> },
    ]

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        plugins={plugins}
        config={{
          _ui: { type: "ui", props: { config: {} } } as any,
        }}
      />
    )

    const nodes = screen.getAllByTestId("p")
    expect(nodes.map((n) => n.textContent)).toEqual(["1", "2", "3"])
  })

  it("allows plugin to return null", () => {
    const plugin = { name: "noop", render: () => null }

    expect(() =>
      renderWithBlueFormProvider(
        <BlueForm
          renderRoot={TestRoot}
          plugins={[plugin]}
          config={{
            _ui: { type: "ui", props: { config: {} } } as any,
          }}
        />
      )
    ).not.toThrow()
  })

  it("plugin can observe form value changes", async () => {
    const changes: any[] = []

    const plugin = {
      name: "watcher",
      render: (form: any) => {
        form.watch((v: any) => {
          changes.push(v)
        })

        return null
      },
    }

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        plugins={[plugin]}
        config={{
          name: {
            type: "inline",
            render: ({ fieldProps: { onChange } }) => (
              <button type="button" onClick={() => onChange?.("A")}>
                Change
              </button>
            ),
          },
        }}
      />
    )

    fireEvent.click(screen.getByText("Change"))

    await waitFor(() => {
      expect(changes.length).toBeGreaterThan(0)
      expect(changes.at(-1)).toEqual({ name: "A" })
    })
  })

  it("mounts devToolPlugin without crashing", () => {
    expect(() =>
      renderWithBlueFormProvider(
        <BlueForm
          renderRoot={TestRoot}
          plugins={[devToolPlugin()]}
          config={{
            _ui: { type: "ui", props: { config: {} } } as any,
          }}
        />
      )
    ).not.toThrow()
  })

  // it('renders DevTool when plugin is enabled', async () => {
  //   renderWithBlueFormProvider(
  //     <BlueForm
  //       renderRoot={TestRoot}
  //       plugins={[devToolPlugin()]}
  //       config={{
  //         _ui: {
  //           type: 'inline',
  //           render: () => <div data-testid="inline">placeholder</div>,
  //         },
  //       }}
  //     />
  //   );

  //   expect(screen.getByTestId('inline')).toBeDefined();
  //   // const toggle = await screen.findByTitle('Show dev panel');
  //   // expect(toggle).toBeTruthy();
  //   await waitFor(() => {
  //     const btn = document.querySelector('button[title="Show dev panel"]');
  //     expect(btn).not.toBeNull();
  //   });
  // });
})
