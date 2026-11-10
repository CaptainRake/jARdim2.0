import {
  create,
} from 'zustand';

import {
  persist,
  createJSONStorage,
} from 'zustand/middleware';


export const useTrashStore =
  create(
    persist(
      (set) => ({
        trashOnMap: [],

        collectedTrash: [],


        setTrashOnMap:
          (items) =>
            set({
              trashOnMap:
                items,
            }),


        collectTrash:
          (trashInstanceId) =>
            set(
              (state) => {
                const item =
                  state.trashOnMap.find(
                    (trash) =>
                      trash.instanceId ===
                      trashInstanceId
                  );


                if (!item) {
                  return state;
                }


                return {
                  trashOnMap:
                    state.trashOnMap.filter(
                      (trash) =>
                        trash.instanceId !==
                        trashInstanceId
                    ),

                  collectedTrash: [
                    ...state.collectedTrash,
                    item,
                  ],
                };
              }
            ),


        resetTrash:
          () =>
            set({
              trashOnMap: [],
              collectedTrash: [],
            }),
      }),

      {
        name:
          'rebrota-trash',

        storage:
          createJSONStorage(
            () =>
              sessionStorage
          ),
      }
    )
  );