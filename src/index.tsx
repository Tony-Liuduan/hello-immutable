import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import App from './App';

ReactDOM.render(
    <BrowserRouter basename='/'>
        <Switch>
            <Route component={App} />
        </Switch>
    </BrowserRouter>,
    document.getElementById('root'),
);