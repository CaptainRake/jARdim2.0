import { useNavigate } from 'react-router-dom';

export default function Enter() {
  const navigate = useNavigate();

  return (
    <main className="login-screen">

      {/* CÉU */}
      <img
        src={`${import.meta.env.BASE_URL}login/Login_sky.png`}
        className="login-sky"
        alt=""
      />

      {/* NUVENS */}
      <div className="login-clouds-track">
        <img
          src={`${import.meta.env.BASE_URL}login/Login_clouds.png`}
          className="login-clouds"
          alt=""
        />

        <img
          src={`${import.meta.env.BASE_URL}login/Login_clouds.png`}
          className="login-clouds"
          alt=""
        />
      </div>

      {/* ÁRVORES */}
      <img
        src={`${import.meta.env.BASE_URL}login/Login_trees.png`}
        className="login-trees"
        alt=""
      />

      {/* LOGO + BOTÕES */}
      <img
        src={`${import.meta.env.BASE_URL}login/Login_buttons.png`}
        className="login-buttons-art"
        alt="RE:brota"
      />

      {/* ÁREAS CLICÁVEIS */}

      <button
        className="login-hitbox login-hitbox-enter"
        aria-label="Entrar"
        onClick={() => navigate('/login')}
      />

      <button
        className="login-hitbox login-hitbox-register"
        aria-label="Criar conta"
        onClick={() => navigate('/register')}
      />

      <button
        className="login-hitbox login-hitbox-guest"
        aria-label="Entrar como convidado"
        onClick={() => navigate('/home')}
      />

    </main>
  );
}