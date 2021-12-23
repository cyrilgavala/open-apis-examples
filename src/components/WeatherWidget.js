import {useEffect, useState} from "react";
import axios from "axios";

export default function WeatherWidget() {

    const [place, setPlace] = useState("")
    const [coords, setCoords] = useState({})
    const [data, setData] = useState({})
    const [locationEnabled, setLocationEnabled] = useState(true)
    const [isLoading, setLoading] = useState(false)
    const [expand, setExpand] = useState(false)

    const appId = process.env.REACT_APP_APP_ID

    const fetchData = params => {
        axios.get("https://api.openweathermap.org/data/2.5/weather", {params: params})
            .catch(err => {
                setData({})
                console.error(err)
            })
            .then(res => {
                setData(res.data)
            })
        setLoading(false)
    }

    useEffect(() => {
        const loadDataForCurrentPosition = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(position => {
                    setCoords(position.coords)
                    const params = {
                        appId: appId,
                        lat: position.coords.latitude,
                        lon: position.coords.longitude,
                        units: "metric"
                    }
                    fetchData(params)
                }, error => {
                    console.error(error)
                    setLoading(false)
                    setLocationEnabled(false)
                })
            }
        }
        setLoading(true)
        loadDataForCurrentPosition()
    }, [appId, locationEnabled])

    const handleInput = event => {
        event.preventDefault()
        setPlace(event.target.value)
    }

    const handleExpand = () => {
        setExpand(!expand)
    }

    const loadData = event => {
        event.preventDefault()
        setLoading(true)
        const params = {
            appId: appId,
            q: place,
            units: "metric"
        }
        fetchData(params)
    }

    const reloadData = () => {
        setLoading(true)
        let params
        if (locationEnabled) {
            params = {
                appId: appId,
                lat: coords.latitude,
                lon: coords.longitude,
                units: "metric"
            }
        } else {
            params = {
                appId: appId,
                q: place,
                units: "metric"
            }
        }
        fetchData(params)
    }

    const calculateDirection = (deg) => {
        const val = Math.round((deg/22.5)+.5)
        const arr = ["N","NNE","NE","ENE","E","ESE", "SE", "SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"]
        return arr[(val % 16)]
    }

    const getRainOrSnow = (data, range) => {
        if (data.snow !== undefined && range in data.snow) {
            return data.snow[range] + " mm"
        }
        if (data.rain !== undefined && range in data.rain) {
            return data.rain[range] + " mm"
        }
        return "N/A"
    }

    const getRainOrSnowLabel = data => {
        if ("snow" in data) {
            return "Snow"
        } else {
            return "Rain"
        }
    }

    return <div id={"weather-container"}>
        {!isLoading && <button id={"reload-btn"} onClick={reloadData}>&#10227;</button>}
        {!isLoading && !locationEnabled &&
            <form id={"weather-form"} onSubmit={loadData}>
                <input id={"weather-input"} type={"text"} value={place} placeholder={"Enter place"}
                       onChange={handleInput}/>
            </form>}
        {!isLoading && Object.keys(data).length > 0 &&
            <div>
                <div className={"widget-title"}>Weather for {data.name}</div>
                <div id={"weather-data"} onClick={handleExpand}>
                    <p>Conditions:</p>
                    <p>{data.weather[0].main}</p>
                    <p>Temperature (actual):</p>
                    <p>{data.main.temp} &#176;C</p>
                    {expand && <p>Temperature (feels like):</p>}
                    {expand && <p>{data.main.feels_like} &#176;C</p>}
                    {expand && <p>{getRainOrSnowLabel(data)} (last 1 hour):</p>}
                    {expand && <p>{getRainOrSnow(data, "1h")}</p>}
                    {expand && <p>{getRainOrSnowLabel(data)} (last 3 hour):</p>}
                    {expand && <p>{getRainOrSnow(data, "3h")}</p>}
                    <p>Pressure:</p>
                    <p>{data.main.pressure} hPa</p>
                    {expand && <p>Humidity:</p>}
                    {expand && <p>{data.main.humidity} %</p>}
                    <p>Wind speed:</p>
                    <p>{data.wind.speed} m/s</p>
                    {expand && <p>Wind gust:</p>}
                    {expand && <p>{data.wind.gust ? data.wind.gust + "m/s": "N/A"}</p>}
                    {expand && <p>Wind direction:</p>}
                    {expand && <p>{calculateDirection(data.wind.deg)}</p>}
                    {expand && <p>Clouds:</p>}
                    {expand && <p>{data.clouds.all} %</p>}
                </div>
                <div className={"widget-note"}>Data loaded at {new Date(data.dt * 1000).toLocaleString()}</div>
            </div>}
        {isLoading && <div className="spinner">
            <div/>
            <div/>
            <div/>
        </div>}
    </div>
}