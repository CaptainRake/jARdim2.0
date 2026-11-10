import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  useProgressStore,
  MAIN_MISSIONS,
  DAILY_MISSIONS,
} from '../stores/progressStore';


export default function MissionNotifications() {

  const currentMissionId =
    useProgressStore(
      (state) =>
        state.currentMissionId
    );

  const completedMissions =
    useProgressStore(
      (state) =>
        state.completedMissions
    );

  const foundAnimals =
    useProgressStore(
      (state) =>
        state.foundAnimals
    );

  const discoveries =
    useProgressStore(
      (state) =>
        state.discoveries
    );

  const readAnimals =
    useProgressStore(
      (state) =>
        state.readAnimals
    );

  const firstSteps =
    useProgressStore(
      (state) =>
        state.firstSteps
    );

  const daily =
    useProgressStore(
      (state) =>
        state.daily
    );

  const flagMissionUpdate =
    useProgressStore(
      (state) =>
        state.flagMissionUpdate
    );


  const [
    queue,
    setQueue,
  ] =
    useState([]);


  const [
    visible,
    setVisible,
  ] =
    useState(null);


  const [
    leaving,
    setLeaving,
  ] =
    useState(false);


  /*
    Guarda o último estado
    das missões sem causar render.
  */

  const previousRef =
    useRef(null);


  /*
    =========================================================
    OBSERVA PROGRESSO DAS MISSÕES
    =========================================================
  */

  useEffect(() => {

    /*
      Montamos um snapshot apenas
      com os dados necessários.
    */

    const state = {
      currentMissionId,
      completedMissions,
      foundAnimals,
      discoveries,
      readAnimals,
      firstSteps,
      daily,
    };


    const currentMission =
      MAIN_MISSIONS.find(
        (mission) =>
          mission.id ===
          currentMissionId
      );


    const dailyMission =
      DAILY_MISSIONS.find(
        (mission) =>
          mission.id ===
          daily.missionId
      );


    const currentValue =
      currentMission
        ? currentMission
            .getValue(state)
        : 0;


    const dailyValue =
      dailyMission
        ? dailyMission
            .getValue(state)
        : 0;


    const snapshot = {
      currentMissionId,

      completedMissions: [
        ...completedMissions,
      ],

      currentValue,

      dailyValue,

      dailyCompleted:
        daily.completed,
    };


    /*
      Primeira vez que o componente
      monta: só registra o estado.
      Não cria popup.
    */

    if (!previousRef.current) {

      previousRef.current =
        snapshot;

      return;
    }


    const previous =
      previousRef.current;


    const notifications = [];


    /*
      =====================================================
      MISSÃO PRINCIPAL CONCLUÍDA
      =====================================================
    */

    const newlyCompleted =
      completedMissions.filter(
        (missionId) =>
          !previous
            .completedMissions
            .includes(
              missionId
            )
      );


    newlyCompleted.forEach(
      (missionId) => {

        const mission =
          MAIN_MISSIONS.find(
            (item) =>
              item.id ===
              missionId
          );


        if (!mission) {
          return;
        }


        notifications.push({
          id:
            `complete-${mission.id}-${Date.now()}`,

          type:
            'complete',

          eyebrow:
            'Missão concluída',

          title:
            mission.title,

          text:
            `+${mission.reward.xp} XP · 🍃 +${mission.reward.leaves}`,
        });
      }
    );


    /*
      =====================================================
      NOVA MISSÃO
      =====================================================
    */

    if (
      currentMissionId !==
        previous.currentMissionId &&

      currentMission
    ) {

      notifications.push({
        id:
          `new-${currentMission.id}-${Date.now()}`,

        type:
          'new',

        eyebrow:
          'Nova missão disponível',

        title:
          currentMission.title,

        text:
          currentMission.description,
      });
    }


    /*
      =====================================================
      PROGRESSO DA MISSÃO
      =====================================================
    */

    if (
      newlyCompleted.length === 0 &&

      currentMissionId ===
        previous.currentMissionId &&

      currentMission &&

      currentValue >
        previous.currentValue
    ) {

      notifications.push({
        id:
          `progress-${currentMission.id}-${Date.now()}`,

        type:
          'progress',

        eyebrow:
          'Progresso da missão',

        title:
          currentMission.title,

        text:
          `${currentValue}/${currentMission.goal}`,
      });
    }


    /*
      =====================================================
      MISSÃO DIÁRIA CONCLUÍDA
      =====================================================
    */

    if (
      !previous.dailyCompleted &&
      daily.completed &&
      dailyMission
    ) {

      notifications.push({
        id:
          `daily-complete-${Date.now()}`,

        type:
          'complete',

        eyebrow:
          'Missão diária concluída',

        title:
          dailyMission.title,

        text:
          `+${dailyMission.reward.xp} XP · 🍃 +${dailyMission.reward.leaves}`,
      });
    }


    /*
      =====================================================
      PROGRESSO DIÁRIO
      =====================================================

      A missão de caminhada não gera
      popup a cada atualização de GPS.
    */

    if (
      dailyMission &&

      dailyMission.id !==
        'daily-walk' &&

      !daily.completed &&

      dailyValue >
        previous.dailyValue
    ) {

      notifications.push({
        id:
          `daily-progress-${Date.now()}`,

        type:
          'progress',

        eyebrow:
          'Progresso diário',

        title:
          dailyMission.title,

        text:
          `${dailyValue}/${dailyMission.goal}`,
      });
    }


    /*
      Atualiza referência ANTES
      de disparar outros estados.
      Isso evita loops.
    */

    previousRef.current =
      snapshot;


    if (
      notifications.length === 0
    ) {
      return;
    }


    setQueue(
      (current) => [
        ...current,
        ...notifications,
      ]
    );


    flagMissionUpdate();

  }, [
    currentMissionId,
    completedMissions,
    foundAnimals,
    discoveries,
    readAnimals,
    firstSteps,
    daily,
    flagMissionUpdate,
  ]);


  /*
    =========================================================
    PEGA PRÓXIMA NOTIFICAÇÃO
    =========================================================
  */

  useEffect(() => {

    if (visible) {
      return;
    }


    if (
      queue.length === 0
    ) {
      return;
    }


    const [
      next,
      ...remaining
    ] =
      queue;


    setVisible(next);

    setQueue(
      remaining
    );

  }, [
    queue,
    visible,
  ]);


  /*
    =========================================================
    TEMPO + SAÍDA
    =========================================================
  */

  useEffect(() => {

    if (!visible) {
      return;
    }


    const exitTimer =
      window.setTimeout(
        () => {
          setLeaving(true);
        },
        2700
      );


    const removeTimer =
      window.setTimeout(
        () => {

          setVisible(null);

          setLeaving(false);

        },
        3200
      );


    return () => {

      window.clearTimeout(
        exitTimer
      );

      window.clearTimeout(
        removeTimer
      );

    };

  }, [
    visible,
  ]);


  /*
    =========================================================
    NADA PARA MOSTRAR
    =========================================================
  */

  if (!visible) {
    return null;
  }


  return (
    <div
      className={`
        mission-toast
        mission-toast-${visible.type}
        ${
          leaving
            ? 'mission-toast-leaving'
            : ''
        }
      `}
    >

      <div className="mission-toast-icon">

        {visible.type ===
        'complete'
          ? '✓'
          : visible.type ===
            'new'
          ? '!'
          : '↑'}

      </div>


      <div className="mission-toast-content">

        <span>
          {visible.eyebrow}
        </span>


        <strong>
          {visible.title}
        </strong>


        <p>
          {visible.text}
        </p>

      </div>

    </div>
  );
}