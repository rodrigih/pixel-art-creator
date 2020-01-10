import React from "react";
import "./colourPalette.css";

import "../../assets/pencilcursor.svg";

interface ColourPaletteProps {
  colourArr: Array<string>;
  activeColour: number;
  handleButtonClick: (ind: number) => void;
  handleColourChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ColourPalette = (props: ColourPaletteProps) => {
  const { colourArr, activeColour } = props;

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

  const currColour = colourArr[activeColour];

  return (
    <div className="palette">
      <h1>Colour Palette</h1>
      <div className="colour-palette">{displayPalette(paletteRows)}</div>

      <div className="colour-changer-container">
        <label htmlFor="colour-changer"> Click to change colour: </label>

        <input
          type="color"
          name="current-colour"
          id="colour-changer"
          value={currColour}
          onChange={props.handleColourChange}
        />
      </div>
    </div>
  );
};

export default ColourPalette;
