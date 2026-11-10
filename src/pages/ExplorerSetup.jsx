import {
  useState,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import {
  useOnboardingStore,
} from '../stores/onboardingStore';


export default function ExplorerSetup() {
  const navigate =
    useNavigate();


  const savedName =
    useOnboardingStore(
      (state) =>
        state.playerName
    );


  const setPlayerName =
    useOnboardingStore(
      (state) =>
        state.setPlayerName
    );


  const [
    name,
    setName,
  ] =
    useState(
      savedName ?? ''
    );


  const validName =
    name.trim().length >= 2;


  function handleContinue() {
    if (!validName) {
      return;
    }


    setPlayerName(
      name
    );


    navigate(
      '/backpack-select'
    );
  }


  return (
    <main className="explorer-setup-page">

      <div className="explorer-setup-content">

        <span className="explorer-setup-kicker">
          IDENTIFICAÇÃO DE CAMPO
        </span>


        <h1>
          Como devemos chamar você?
        </h1>


        <p>
          Esse nome aparecerá no seu crachá de explorador.
        </p>


        <div className="explorer-name-card">

          <div className="explorer-name-avatar">
            ◉
          </div>


          <label
            htmlFor="explorer-name"
          >
            Nome do explorador
          </label>


          <input
            id="explorer-name"

            type="text"

            value={name}

            maxLength={24}

            autoComplete="off"

            placeholder="Digite seu nome"

            onChange={(event) =>
              setName(
                event.target.value
              )
            }

            onKeyDown={(event) => {
              if (
                event.key ===
                'Enter'
              ) {
                event.currentTarget
                  .blur();

                handleContinue();
              }
            }}
          />


          <span className="explorer-name-counter">
            {name.length}/24
          </span>

        </div>


        <button
          type="button"

          className="explorer-setup-button"

          disabled={
            !validName
          }

          onClick={() => {
            document
              .activeElement
              ?.blur();

            handleContinue();
          }}
        >
          Criar identificação
        </button>

      </div>

    </main>
  );
}