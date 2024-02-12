import type { Multiplicators } from './interfaces';

export const multiplicators: Multiplicators = {
  multipleChoice: 5,
  numberGuess: 10,
  mapPointGuess: 10,
};

export const ColorDefaults = {
  Cover: {
    Color: {
      Background: '#5A5ED1',
      Text: '#ffffff',
    },
    Button: {
      Color: {
        Text: '#2C32BD',
        Background: '#ffffff',
        Hover: '#fafafa',
        Disabled: '#f7f7f7',
      },
    },
  },
  Button: {
    Color: {
      Text: '#ffffff',
      Background: '#000000',
      Hover: '#333333',
      Disabled: '#999999',
    },
  },
};
