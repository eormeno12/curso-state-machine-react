import { assign, createMachine } from 'xstate';
import { fetchCountries } from '../Utils/api';

const fillCountries = {
  initial: "loading",
  states: {
    loading: {
      invoke: {
        id: 'getCountries',
        src: () => fetchCountries,
        onDone: {
          target: 'success',
          actions: assign({
            countries: (context, event) => event.data,
          })
        },
        onError: {
          target: 'failure',
          actions: assign({
            error: 'Request Failed.',
          })
        }
      }
    },
    success: {},
    failure: {
      on: {
        RETRY: { target: "loading" },
      },
    },
  },
};

const bookingMachine = createMachine({
  id: 'buy plane tickets',
  initial: 'initial',
  context: {
    passengers: [],
    selectedCountry: '',
    countries: [],
    error: ''
  },
  states: {
    'initial': {
      entry: 'resetContext',
      on: {
        START: {
          target: 'search',
          // actions: 'printStart'
        }
      }
    },
    'search': {
      // entry: 'printEntry',
      // exit: 'printExit',
      on: {
        CONTINUE: {
          target: 'passengers',
          actions: 'setSelectedCountry',
        },
        CANCEL: 'initial'
      },
      ...fillCountries,
    },
    'passengers': {
      on: {
        DONE: {
          target: 'ticket',
          cond: 'moreThanOnePassenger'
        },
        CANCEL: 'initial',
        ADD: {
          target: 'passengers',
          actions: 'addPassenger'
        }
      }
    },
    'ticket': {
      after: {
        5000: {
          target: 'initial',
        }
      },
      on: {
        FINISH: 'initial'
      }
    },
  },
},
{
  actions: {
    // printStart: () => {console.log('Print Start')},
    // printEntry: () => {console.log('Print Entry')},
    // printExit: () => {console.log('Print Exit')},
    setSelectedCountry: assign({
      selectedCountry: (context, event) => event.selectedCountry,
    }),
    addPassenger: assign((context, event) => {
      const newPassengers = [...context.passengers, event.newPassenger];

      return {
        passengers: newPassengers
      }
    }),
    resetContext: assign({
      selectedCountry: '',
      passengers: [],
      error: '',
    }),
  },
  guards: {
    moreThanOnePassenger: (context) => {
      return context.passengers.length >= 1;
    }
  }
},);

export { bookingMachine };

// ----- PARALLEL MACHINE EXAMPLE -----
// const fileMachine = createMachine({
//   id: 'files',
//   type: 'parallel',
//   states: {
//     upload: {
//       initial: 'initial',
//       states: {
//         initial: {
//           on: {
//             INIT_UPLOAD: {target: 'loading'}
//           }
//         },
//         loading: {
//           on: {
//             UPLOAD_COMPLETE: {target: 'finish'}
//           }
//         },
//         finish: {},
//       }
//     },
//     download: {
//       initial: 'initial',
//       states: {
//         initial: {
//           on: {
//             INIT_DOWNLOAD: {target: 'loading'}
//           }
//         },
//         loading: {
//           on: {
//             DOWNLOAD_COMPLETE: {target: 'finish'}
//           }
//         },
//         finish: {}
//     }
//   }
// });