import BlueForm from '@/components/form/BlueForm';
import { HiddenField } from '@/components/form/field';
import { useArrayField } from '@/components/form/provider';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithBlueFormProvider } from '../_utils/render-form';
import { useFormContext, useWatch } from 'react-hook-form';

const TestRoot = ({ children, onSubmit }: any) => (
  <form onSubmit={onSubmit}>
    {children}
    <button type="submit">Submit</button>
  </form>
);

describe('BlueForm - field array', () => {
  it('ignores defaultValue defined on array field config', async () => {
    let submitted: any = null;
    const ArrayUI = () => {
      const { append, update } = useArrayField();
      return (
        <>
          <button type="button" onClick={() => append({})}>
            Add
          </button>
          <button
            type="button"
            onClick={() => update(0, { name: 'Alice' })}
          >
            Set Name
          </button>
        </>
      );
    };

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(v) => (submitted = v)}
        config={{
          users: {
            type: 'array',
            defaultValue: [{ name: 'Default' }],
            props: {
              config: {
                name: {
                  type: 'hidden',
                },
              },
            },
          },
        }}
        fieldMapping={{
          array: ArrayUI,
          hidden: HiddenField,
        }}
      />,
    );

    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(submitted).toEqual({
        users: [],
      });
    });
  });

  it('throws error when array field has no mapping and no render', () => {
    expect(() =>
      renderWithBlueFormProvider(
        <BlueForm
          renderRoot={TestRoot}
          config={{
            users: {
              type: 'array',
              props: {
                config: {},
              },
            },
          }}
        />,
      ),
    ).toThrow(/array/i);
  });

  it('renders array using render() when no mapping is provided', () => {
    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        config={{
          users: {
            type: 'array',
            render: () => <div data-testid="custom-array" />,
            props: {
              config: {},
            },
          },
        }}
      />,
    );

    expect(screen.getByTestId('custom-array')).toBeDefined();
  });

  it('appends item to array and updates form values', async () => {
    let snapshot: any = null;

    const ArrayUI = () => {
      const { append } = useArrayField();
      return (
        <button type="button" onClick={() => append({})}>
          Add
        </button>
      );
    };

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onFormChange={(v) => (snapshot = v)}
        config={{
          users: {
            type: 'array',
            props: {
              config: {},
            },
          },
        }}
        fieldMapping={{
          array: ArrayUI,
        }}
      />,
    );

    fireEvent.click(screen.getByText('Add'));

    await waitFor(() => {
      expect(snapshot).toEqual({ users: [{}] });
    });
  });

  it('updates array item value correctly', async () => {
    let snapshot: any = null;

    const ArrayUI = () => {
      const { append, update } = useArrayField();
      return (
        <>
          <button type="button" onClick={() => append({})}>
            Add
          </button>
          <button type="button" onClick={() => update(0, { name: 'Alice' })}>
            Set Name
          </button>
        </>
      );
    };

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onFormChange={(v) => (snapshot = v)}
        config={{
          users: {
            type: 'array',
            props: {
              config: {},
            },
          },
        }}
        fieldMapping={{
          array: ArrayUI,
        }}
      />,
    );

    fireEvent.click(screen.getByText('Add'));
    fireEvent.click(screen.getByText('Set Name'));

    await waitFor(() => {
      expect(snapshot).toEqual({
        users: [{ name: 'Alice' }],
      });
    });
  });

  it('removes array item and updates form values', async () => {
    let snapshot: any = null;

    const ArrayUI = () => {
      const { append, remove } = useArrayField();
      return (
        <>
          <button type="button" onClick={() => append({})}>
            Add
          </button>
          <button type="button" onClick={() => remove(0)}>
            Remove
          </button>
        </>
      );
    };

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onFormChange={(v) => (snapshot = v)}
        config={{
          users: {
            type: 'array',
            props: {
              config: {},
            },
          },
        }}
        fieldMapping={{
          array: ArrayUI,
        }}
      />,
    );

    fireEvent.click(screen.getByText('Add'));
    fireEvent.click(screen.getByText('Remove'));

    await waitFor(() => {
      expect(snapshot).toEqual({ users: [] });
    });
  });

  it('submits array payload correctly', async () => {
    let submitted: any = null;

    const ArrayUI = () => {
      const { append } = useArrayField();
      return (
        <button type="button" onClick={() => append({ name: 'Bob' })}>
          Add
        </button>
      );
    };

    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        onSubmit={(data) => (submitted = data)}
        config={{
          users: {
            type: 'array',
            props: {
              config: {},
            },
          },
        }}
        fieldMapping={{
          array: ArrayUI,
        }}
      />,
    );

    fireEvent.click(screen.getByText('Add'));
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(submitted).toEqual({
        users: [{ name: 'Bob' }],
      });
    });
  });

  it('supports useArrayField with renderItem inside array render()', async () => {
    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        config={{
          users: {
            type: 'array',
            render: () => {
              const { items, append, renderItems } = useArrayField();
              return (
                <>
                  <button
                    type="button"
                    onClick={() => append({ name: "Alice" })}
                  >
                    Add user
                  </button>

                  {renderItems()}
                </>
              )
            },
            props: {
              config: {
                name: {
                  type: 'inline',
                  render: () => <div data-testid="user-item" />,
                },
              },
            },
          },
        }}
      />,
    );

    expect(screen.queryByTestId('user-item')).toBeNull();
    fireEvent.click(screen.getByText('Add user'));
    await waitFor(() => {
      expect(screen.getByTestId('user-item')).toBeDefined();
    });
  });

  it('shows error when array is required and empty', async () => {
    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        config={{
          users: {
            type: 'array',
            rules: { required: 'Users is required' },
            render: ({ fieldProps }) => {
              const { append } = useArrayField();
              return (
                <>
                  {fieldProps.errorMessage && (
                    <div data-testid="error">{fieldProps.errorMessage}</div>
                  )}
                  <button data-testid="submit" type="submit">
                    Submit
                  </button>
                  <button type="button" onClick={() => append({ name: '' })}>
                    Add
                  </button>
                </>
              );
            },
            props: {
              config: {
                name: {
                  type: 'inline',
                  render: () => <div />,
                },
              },
            },
          },
        }}
      />,
    );

    fireEvent.click(screen.getByTestId('submit'));

    await waitFor(() => {
      expect(screen.getByTestId('error')).toBeDefined();
    });
  });

  it('shows error when array length is less than minLength', async () => {
    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        config={{
          users: {
            type: 'array',
            rules: { minLength: { value: 2, message: 'At least 2 users' } },
            render: ({ fieldProps }) => {
              const { append } = useArrayField();
              return (
                <>
                  {fieldProps.errorMessage && (
                    <div data-testid="error">{fieldProps.errorMessage}</div>
                  )}
                  <button type="button" onClick={() => append({ name: '' })}>
                    Add
                  </button>
                  <button type="submit" />
                </>
              );
            },
            props: {
              config: {
                name: {
                  type: 'inline',
                  render: () => <div />,
                },
              },
            },
          },
        }}
      />,
    );

    fireEvent.click(screen.getByText('Add'));
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(screen.getByTestId('error')).toBeDefined();
    });
  });

  it('shows error when array length exceeds maxLength', async () => {
    renderWithBlueFormProvider(
      <BlueForm
        renderRoot={TestRoot}
        config={{
          users: {
            type: 'array',
            rules: { maxLength: { value: 1, message: 'Only 1 user allowed' } },
            render: ({ fieldProps }) => {
              const { append } = useArrayField();
              return (
                <>
                  {fieldProps.errorMessage && (
                    <div data-testid="error">{fieldProps.errorMessage}</div>
                  )}
                  <button type="button" onClick={() => append({ name: '' })}>
                    Add
                  </button>
                  <button type="submit" />
                </>
              );
            },
            props: {
              config: {
                name: {
                  type: 'inline',
                  render: () => <div />,
                },
              },
            },
          },
        }}
      />,
    );

    fireEvent.click(screen.getByText('Add'));
    fireEvent.click(screen.getByText('Add'));
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(screen.getByTestId('error')).toBeDefined();
    });
  });

  describe("useArrayField - clear()", () => {
    it("clears all items when calling clear() (remove() with no index)", async () => {
      renderWithBlueFormProvider(
        <BlueForm
          renderRoot={TestRoot}
          config={{
            users: {
              type: "array",
              render: () => {
                const { items, append, clear } = useArrayField()
                return (
                  <>
                    <div data-testid="count">{items.length}</div>

                    <button type="button" onClick={() => append({ name: "" })}>
                      Add
                    </button>

                    <button type="button" onClick={() => clear()}>
                      Clear
                    </button>
                  </>
                )
              },
              props: {
                config: {
                  name: { type: "inline", render: () => <div /> },
                },
              },
            },
          }}
        />,
      )

      // Add 2 items
      fireEvent.click(screen.getByText("Add"))
      fireEvent.click(screen.getByText("Add"))

      await waitFor(() => {
        expect(screen.getByTestId("count").textContent).toBe("2")
      })

      // Clear all
      fireEvent.click(screen.getByText("Clear"))

      await waitFor(() => {
        expect(screen.getByTestId("count").textContent).toBe("0")
      })
    })
  })

  describe("useArrayField - pop()", () => {
    it("removes last item when calling pop()", async () => {
      renderWithBlueFormProvider(
        <BlueForm
          renderRoot={TestRoot}
          config={{
            users: {
              type: "array",
              render: () => {
                const { items, append, pop } = useArrayField()
                return (
                  <>
                    <div data-testid="count">{items.length}</div>

                    <button type="button" onClick={() => append({ name: "" })}>
                      Add
                    </button>

                    <button type="button" onClick={() => pop()}>
                      Pop
                    </button>
                  </>
                )
              },
              props: {
                config: {
                  name: { type: "inline", render: () => <div /> },
                },
              },
            },
          }}
        />,
      )

      fireEvent.click(screen.getByText("Add"))
      fireEvent.click(screen.getByText("Add"))
      fireEvent.click(screen.getByText("Add"))

      await waitFor(() => {
        expect(screen.getByTestId("count").textContent).toBe("3")
      })

      fireEvent.click(screen.getByText("Pop"))

      await waitFor(() => {
        expect(screen.getByTestId("count").textContent).toBe("2")
      })
    })
  })

  describe("useArrayField - renderItems()", () => {
    it("renders one item node per array element", async () => {
      renderWithBlueFormProvider(
        <BlueForm
          renderRoot={TestRoot}
          config={{
            users: {
              type: "array",
              render: () => {
                const { append, renderItems, items } = useArrayField()
                return (
                  <>
                    <div data-testid="count">{items.length}</div>
                    <button type="button" onClick={() => append({ name: "" })}>
                      Add
                    </button>

                    <div data-testid="list">{renderItems()}</div>
                  </>
                )
              },
              props: {
                config: {
                  name: {
                    type: "inline",
                    render: () => <div data-testid="row" />,
                  },
                },
              },
            },
          }}
        />,
      )

      fireEvent.click(screen.getByText("Add"))
      fireEvent.click(screen.getByText("Add"))
      fireEvent.click(screen.getByText("Add"))

      await waitFor(() => {
        expect(screen.getByTestId("count").textContent).toBe("3")
      })

      await waitFor(() => {
        expect(screen.getAllByTestId("row").length).toBe(3)
      })
    })
  })

  describe("useArrayField - duplicate()", () => {
    it("duplicates current item values (after edits) into a new item", async () => {
      renderWithBlueFormProvider(
        <BlueForm
          renderRoot={TestRoot}
          config={{
            users: {
              type: "array",
              render: () => {
                const { append, duplicate } = useArrayField()
                const { setValue } = useFormContext()

                const users = useWatch({ name: "users" }) as any[] | undefined

                return (
                  <>
                    <button type="button" onClick={() => append({ name: "A" })}>
                      AddA
                    </button>

                    <button
                      type="button"
                      onClick={() => setValue("users.0.name", "Edited")}
                    >
                      Edit0
                    </button>

                    <button type="button" onClick={() => duplicate(0)}>
                      Duplicate0
                    </button>

                    <pre data-testid="users">
                      {JSON.stringify(users ?? null)}
                    </pre>
                  </>
                )
              },
              props: {
                config: {
                  name: { type: "inline", render: () => <div /> },
                },
              },
            },
          }}
        />,
      )

      fireEvent.click(screen.getByText("AddA"))

      await waitFor(() => {
        const users = JSON.parse(
          screen.getByTestId("users").textContent || "null",
        )
        expect(users.length).toBe(1)
        expect(users[0].name).toBe("A")
      })

      fireEvent.click(screen.getByText("Edit0"))

      await waitFor(() => {
        const users = JSON.parse(
          screen.getByTestId("users").textContent || "null",
        )
        expect(users[0].name).toBe("Edited")
      })

      fireEvent.click(screen.getByText("Duplicate0"))

      await waitFor(() => {
        const users = JSON.parse(
          screen.getByTestId("users").textContent || "null",
        )
        expect(users.length).toBe(2)
        expect(users[1].name).toBe("Edited") // ✅ expectation for "duplicate current values"
      })
    })
  })

  describe("useArrayField - errorAt()", () => {
    it("returns item error subtree at the given index", async () => {
      renderWithBlueFormProvider(
        <BlueForm
          renderRoot={TestRoot}
          config={{
            users: {
              type: "array",
              render: () => {
                const { append, errorAt } = useArrayField()
                const { setError } = useFormContext()

                const msg = (errorAt(0) as any)?.name?.message

                return (
                  <>
                    <button type="button" onClick={() => append({ name: "" })}>
                      Add
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setError("users.0.name", {
                          type: "manual",
                          message: "Name is required",
                        })
                      }
                    >
                      SetError
                    </button>

                    <div data-testid="msg">{msg ?? ""}</div>
                  </>
                )
              },
              props: {
                config: {
                  name: { type: "inline", render: () => <div /> },
                },
              },
            },
          }}
        />,
      )

      fireEvent.click(screen.getByText("Add"))
      fireEvent.click(screen.getByText("SetError"))

      await waitFor(() => {
        expect(screen.getByTestId("msg").textContent).toBe("Name is required")
      })
    })
  })

  describe("useArrayField - idAt()", () => {
    it("returns stable ids for items (matches items[i].id)", async () => {
      renderWithBlueFormProvider(
        <BlueForm
          renderRoot={TestRoot}
          config={{
            users: {
              type: "array",
              render: () => {
                const { append, items, idAt } = useArrayField()
                return (
                  <>
                    <button type="button" onClick={() => append({ name: "" })}>
                      Add
                    </button>

                    <div data-testid="id0">
                      {items[0] ? String(idAt(0)) : "none"}
                    </div>
                    <div data-testid="id1">
                      {items[1] ? String(idAt(1)) : "none"}
                    </div>

                    <div data-testid="raw0">{items[0]?.id ?? "none"}</div>
                    <div data-testid="raw1">{items[1]?.id ?? "none"}</div>
                  </>
                )
              },
              props: {
                config: {
                  name: { type: "inline", render: () => <div /> },
                },
              },
            },
          }}
        />,
      )

      fireEvent.click(screen.getByText("Add"))
      fireEvent.click(screen.getByText("Add"))

      await waitFor(() => {
        const id0 = screen.getByTestId("id0").textContent
        const raw0 = screen.getByTestId("raw0").textContent
        const id1 = screen.getByTestId("id1").textContent
        const raw1 = screen.getByTestId("raw1").textContent

        expect(id0).toBe(raw0)
        expect(id1).toBe(raw1)
      })
    })
  })
});
