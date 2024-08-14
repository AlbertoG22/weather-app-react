import { useState } from 'react';

const baseUrlCoords = import.meta.env.VITE_REACT_APP_BASE_URL_API_COORDS;
const baseUrlWeather = import.meta.env.VITE_REACT_APP_BASE_URL_WEATHER;
const apiKey = import.meta.env.VITE_REACT_APP_API_KEY;
const DAYS = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export const ForecastApp = () => {
  const [ inputSearch, setInputSearch ] = useState('');
  const [ wheatherData, setWheatherData ] = useState([]);
  const [ isLoading, setIsLoading ] = useState(false);
  const [ cityName, setCityName ] = useState('');
  const [ error, setError ] = useState({ isCoordinatesError: false, isWeatherError: false });

  const searchCoordinates = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setError({ isCoordinatesError: false, isWeatherError: false });
    
    try {
      const resp = await fetch(`${ baseUrlCoords }?q=${ inputSearch }`);
      const data = await resp.json();

      setCityName(`${ data[0].city_name }, ${ data[0].country }`);
      setInputSearch('');

      await searchWeather(data[0].lat, data[0].long);
    } catch(err) {
      console.error(err);
      setInputSearch('');
      setIsLoading(false);
      setError({ isCoordinatesError: true, isWeatherError: true });
    }
  };

  const searchWeather = async ( lat, long ) => {
    try {
      const res = await fetch(`${ baseUrlWeather }?lat=${ lat }&lon=${ long }&units=metric&appid=${ apiKey }`);
      const data = await res.json();
      
      cleanWeatherData(data);
    } catch (err) {
      console.error(err);
      setError( prevState => ({ ...prevState, isWeatherError: true }) );
    }
  };

  const cleanWeatherData = ( data ) => {
    const newWeatherData = [];
    const listOfDays = {};

    data.list.forEach( (day) => {
      const date = day.dt_txt.split(' ')[0];

      if( !listOfDays[date] && newWeatherData.length < 5 ) {
        newWeatherData.push({
          ...day,
          completeDate: getFormattedDate(date),
        });

        listOfDays[date] = true;
      }
    });
    setWheatherData(newWeatherData);
    setIsLoading(false);
  };

  const getFormattedDate = ( date ) => {
    const day = DAYS[new Date(date).getDay()];
    const month = MONTHS[new Date(date).getMonth()];
    const number = new Date(date).getDate();

    return `${day} ${number} ${month}`;
  };

  return (
    <>
      <div className="min-h-screen bg-slate-500 flex flex-col items-center pt-10">
        <h1 className='text-white text-3xl font-bold'>Weather Forecats Challenge 🌥️🌡️</h1>
        <h2 className='text-white text-2xl mt-5 font-semibold'>{ error.isCoordinatesError ? 'Ciudad no encontrada' : cityName }</h2>
        
        <form onSubmit={ searchCoordinates } className="w-full max-w-md my-10 flex justify-center">
          <input
            type="text"
            placeholder="Ingresa la ciudad"
            value={ inputSearch }
            onChange={ (e) => setInputSearch(e.target.value)}
            className="p-2 border rounded-l-md w-2/3"
          />
          <button 
            className="p-2 text-sm bg-slate-800 text-white rounded-r-md hover:bg-blue-900"
            type='submit'
            disabled={ isLoading }
          >
            Search
          </button>
        </form>

        { wheatherData.length > 0 && !error.isWeatherError && (
          <h2 className='text-white text-2xl mt-5 font-semibold'>Clima en los próximos 5 días</h2>
        )}

        <div className="w-full max-w-5xl px-5 mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          { isLoading && !error.isWeatherError ? (
            <div className="col-span-full flex justify-center items-center h-48">
              <p className='text-white text-xl'>Cargando...</p>
            </div>
          ) : (
            !isLoading && error.isWeatherError ? (
              <div className="col-span-full flex-col justify-center items-center h-48">
                <p className="text-white text-xl text-center mb-3">Lo sentimos 🙁</p>
                <p className="text-white text-base text-center">Datos no encontrados, intenta otra opción.</p>
              </div>
            ) : (
              wheatherData.map( (day) => (
                <div
                  key={ day.dt }
                  className="p-4 bg-white rounded-md shadow-md flex flex-col items-center"
                >
                  <h2 className="text-xl font-bold mb-4">{day.completeDate}</h2>
                  <p className="text-gray-600"><span className='font-bold'>Max:</span> { day.main.temp_max }°C</p>
                  <p className="text-gray-600"><span className='font-bold'>Min:</span> { day.main.temp_min }°C</p>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </>
  );
};
