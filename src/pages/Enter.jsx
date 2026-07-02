import { useNavigate } from 'react-router-dom';

export default function Enter() {

    const navigate = useNavigate();

    return (

        <main className="screen">

            <button
                onClick={() => navigate('/login')}
            >
                Fazer Login
            </button>

            <button
                onClick={() => navigate('/home')}
            >
                Entrar como Convidado
            </button>

        </main>

    );

}