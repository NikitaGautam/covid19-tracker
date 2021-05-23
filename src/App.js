import "./App.css";
import {
  FormControl,
  MenuItem,
  Select,
  Card,
  CardContent
} from "@material-ui/core";
import { useState, useEffect } from "react";
import InfoBox from "./Components/InfoBox";
import Map from "./Components/Map";
import Table from "./Components/Table";
import LineGraph from "./Components/LineGraph";

import { sortData, prettyPrintStat } from "./util";

import numeral from "numeral";
import "leaflet/dist/leaflet.css";

function App() {
  const [country, setCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [countries, setCountries] = useState([]);
  const [tableData, setTableData] = useState([]);

  const [mapCountries, setMapCountries] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(2);
  const [casesType, setCasesType] = useState("cases");

  useEffect(() => {
    fetch("https://api.caw.sh/v3/covid-19/all")
      .then(response => response.json())
      .then(data => {
        setCountryInfo(data);
      });
  }, []);

  useEffect(() => {
    // This piece of code runs once when the component loads not again.
    // But if some state passed then it runs when that state is loaded.
    const getCountriesData = async () => {
      fetch("https://api.caw.sh/v3/covid-19/countries")
        .then(response => response.json())
        .then(data => {
          const countries = data.map(country => ({
            name: country.country,
            value: country.countryInfo.iso2
          }));
          let sortedData = sortData(data);
          setTableData(sortedData);
          setMapCountries(data);
          setCountries(countries);
        });
    };

    getCountriesData();
  }, []);

  const onCountryChange = async e => {
    const countryCode = e.target.value;
    const url =
      countryCode === "worldwide"
        ? "https://api.caw.sh/v3/covid-19/all"
        : `https://api.caw.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
      .then(response => response.json())
      .then(data => {
        setCountry(countryCode);
        setCountryInfo(data);

        setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        setMapZoom(5);
      });
  };

  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>COVID TRACKER APPLICATION</h1>
          <FormControl className="app__dropdown">
            <Select
              variant="outlined"
              onChange={onCountryChange}
              value={country}
            >
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {countries.map(country => (
                <MenuItem value={country.value}>{country.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <div className="app__stats">
          {/* InfoBoxes - Cases */}
          <InfoBox
            onClick={e => setCasesType("cases")}
            title="Coronavirus Cases"
            isRed
            active={casesType === "cases"}
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={numeral(countryInfo.cases).format("0.0a")}
          />
          <InfoBox
            onClick={e => setCasesType("recovered")}
            title="Recovered"
            active={casesType === "recovered"}
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={numeral(countryInfo.recovered).format("0.0a")}
          />
          <InfoBox
            onClick={e => setCasesType("deaths")}
            title="Deaths"
            isRed
            active={casesType === "deaths"}
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={numeral(countryInfo.deaths).format("0.0a")}
          />
        </div>

        {/* Map */}

        <Map
          countries={mapCountries}
          casesType={casesType}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>

      <Card className="app__right">
        {/* Cases by Countries - Table */}
        <CardContent>
          <div className="app__information">
            <h3>COVID CASES BY COUNTRY</h3>
            <Table countries={tableData}></Table>
            

            {/* Graph */}
            <h3 className="graph__title"> WorldWide New {casesType}</h3>
            <LineGraph casesType={casesType} className="app__graph"/>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
