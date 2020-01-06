import React from "react";
import "./colourPalette.css";

interface ColourPaletteProps {
  colourArr: Array<string>;
  activeColour: number;
  handleButtonClick: (ind: number) => void;
}

const ColourPalette = (props: ColourPaletteProps) => {
  const paletteRows = props.colourArr.reduce(
    (acc: Array<Array<string>>, curr: string, ind) => {
      if (ind % 3) {
        let currRow: Array<string> = acc[acc.length - 1];
        currRow.push(curr);
      } else {
        acc.push([curr]);
      }

      return acc;
    },
    []
  );

  const displayPalette = (paletteRows: Array<Array<string>>) => {
    return paletteRows.map((row, rowInd) => {
      return (
        <div className="colour-palette-row" key={rowInd}>
          {row.map((curr, colInd) => {
            let key = rowInd * 3 + colInd;
            return (
              <div
                key={key}
                id={key === props.activeColour ? "colour-palette-active" : ""}
                style={{ backgroundColor: curr }}
                onClick={() => {
                  props.handleButtonClick(key);
                }}
              ></div>
            );
          })}
        </div>
      );
    });
  };

  return (
    <div>
      <div className="colour-palette">{displayPalette(paletteRows)}</div>
    </div>
  );
};

export default ColourPalette;
