import {
  useEffect,
  useState,
} from 'react';

import {
  useTrashStore,
} from '../../stores/trashStore';

import {
  useProgressStore,
} from '../../stores/progressStore';

import {
  useEncounterStore,
} from '../../stores/encounterStore';


export default function TrashPopup() {
  const [
    trash,
    setTrash,
  ] =
    useState(null);


  const collectTrash =
    useTrashStore(
      (state) =>
        state.collectTrash
    );


  const collectTrashProgress =
    useProgressStore(
      (state) =>
        state.collectTrashProgress
    );


  const expireEncounter =
    useEncounterStore(
      (state) =>
        state.expireEncounter
    );


  useEffect(() => {
    function handleSelected(
      event
    ) {
      setTrash(
        event.detail
      );
    }


    window.addEventListener(
      'rebrota-trash-selected',
      handleSelected
    );


    return () => {
      window.removeEventListener(
        'rebrota-trash-selected',
        handleSelected
      );
    };
  }, []);


  if (!trash) {
    return null;
  }


  function handleCollect() {
    collectTrash(
      trash.instanceId
    );


    collectTrashProgress({
      xp:
        trash.rewardXP ?? 0,

      leaves:
        trash.rewardLeaves ?? 0,
    });


    expireEncounter();


    setTrash(
      null
    );
  }


  return (
    <div
      className="trash-popup-overlay"
      onClick={() =>
        setTrash(null)
      }
    >

      <section
        className="trash-popup"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        <button
          type="button"
          className="trash-popup-close"
          aria-label="Fechar"
          onClick={() =>
            setTrash(null)
          }
        >
          ×
        </button>


        <span className="trash-popup-category">
          {trash.category}
        </span>


        <model-viewer
          src={`${import.meta.env.BASE_URL}models/${trash.model}`}
          camera-controls
          auto-rotate
          interaction-prompt="none"
          shadow-intensity="0.8"
          className="trash-popup-model"
        />


        <h2>
          {trash.name}
        </h2>


        <p>
          {trash.description}
        </p>


        <button
          type="button"
          className="trash-collect-button"
          onClick={
            handleCollect
          }
        >
          Recolher · +{trash.rewardXP ?? 0} XP · +{trash.rewardLeaves ?? 0} 🍃
        </button>

      </section>

    </div>
  );
}
