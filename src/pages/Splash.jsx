import { useNavigate } from 'react-router-dom';

export default function Splash() {

    const navigate = useNavigate();

    return (

        <main className="screen">

            <h1>jARdim</h1>

            <button
                onClick={() => navigate('/enter')}
            >
                Iniciar
            </button>

        </main>

    );

}