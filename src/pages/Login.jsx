import { useNavigate } from 'react-router-dom';

export default function Login() {

    const navigate = useNavigate();

    return (

        <main className="screen">

            <input placeholder="Email" />

            <input
                placeholder="Senha"
                type="password"
            />

            <button
                onClick={() => navigate('/home')}
            >
                Entrar
            </button>

        </main>

    );

}