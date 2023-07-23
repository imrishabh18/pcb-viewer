import React, { useEffect, useState } from "react"
import { createRoot } from "@tscircuit/react-fiber"
import { AnyElement, createProjectBuilder } from "@tscircuit/builder"
import { CanvasElementsRenderer } from "./components/CanvasElementsRenderer"
import useMouseMatrixTransform from "use-mouse-matrix-transform"
import { useMeasure } from "react-use"
import { compose, scale, translate } from "transformation-matrix"

const defaultTransform = compose(translate(400, 300), scale(40, 40))

type Props = {
  children?: any
  soup?: any
}

export const PCBViewer = ({ children, soup }: Props) => {
  const [stateElements, setStateElements] = useState<Array<AnyElement>>([])
  const [ref, refDimensions] = useMeasure()
  const [transform, setTransform] = useState(defaultTransform)
  const { ref: transformRef } = useMouseMatrixTransform({
    transform,
    onSetTransform: setTransform,
  })

  const [error, setError] = useState(null)

  useEffect(() => {
    if (!children || children?.length === 0) return
    // TODO re-use project builder
    const projectBuilder = createProjectBuilder()
    createRoot()
      .render(children, projectBuilder as any)
      .then((elements) => {
        setStateElements(elements)
        setError(null)
      })
      .catch((e) => {
        setError(e.toString())
        console.log(e.toString())
      })
  }, [children])

  if (error) return <div style={{ color: "red" }}> {error} </div>

  const elements = soup ?? stateElements

  if (elements.length === 0) return null

  return (
    <div ref={transformRef as any}>
      <div ref={ref as any}>
        <CanvasElementsRenderer
          key={refDimensions.width}
          transform={transform}
          height={600}
          width={refDimensions.width}
          grid={{
            spacing: 1,
            view_window: {
              left: 0,
              right: refDimensions.width || 500,
              top: 600,
              bottom: 0,
            },
          }}
          elements={elements.filter((elm) => elm.type.startsWith("pcb_"))}
        />
      </div>
    </div>
  )
}