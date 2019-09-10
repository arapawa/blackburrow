import React, { useState, useEffect } from 'react';
import Airtable from 'airtable';
const baseAMs = new Airtable({ apiKey: 'keylwZtbvFbcT3sgw' }).base('appvtvj7itXI6NPDT');

/* globals $ */
function Home({ accountManager, setAccountManager, accountManagerWrikeId, setAccountManagerWrikeId, accountManagers, setAccountManagers, newOrHistorical, setNewOrHistorical }) {

  // Make airtable calls when app starts
  useEffect(() => {

    // Enable all tooltips on the page
    $(function() {
      $('[data-toggle="tooltip"]').tooltip();
    });

    baseAMs('Account Managers').select({
      view: 'Grid view'
    }).eachPage((records, fetchNextPage) => {

      setAccountManagers(records);

      fetchNextPage();

    }, function done(err) {
      if (err) {
        console.error(err);
        return;
      }
    });

  }, []); // Pass empty array to only run once on mount

  function handleAccountManagerChange(e) {
    let obj = document.getElementById('primaryAccountManager');
    let selectedOption = obj.options[obj.selectedIndex];
    setAccountManager(e.target.value);
    setAccountManagerWrikeId(selectedOption.getAttribute('data-wrikeid'));
  }

  function handleNewOrHistoricalChange(e) {
    setNewOrHistorical(e.target.value);
  }

  let accountManagerNames = accountManagers.map((item) => {
    const value= JSON.stringify(item);
    return (
      <option key={item.id} value={item.fields['Name']} data-wrikeid={item.fields['Wrike ID']}>{item.fields['Name']}</option>
    );
  });

  return (
    <section className="border" id="home">
      <h3 className="mb-5">Welcome!</h3>
      <p>Thank you for using ADURO’s Custom Tile Request Tool. This tool was thoughtfully designed to assist you in creating customer-specific content for your Human Performance platform.</p>
      <p>Requests will be prioritized based on program start dates.</p>
      <p><strong>TILE REQUEST WITH START DATES ON OR BEFORE DECEMBER 31, 2019 - Utilize our original <a href="https://www.wrike.com/form/eyJhY2NvdW50SWQiOjc4MzY3MywidGFza0Zvcm1JZCI6MjE1NDQ3fQk0NzIxMjI4NTU1NjU2CTJkYjM0YTNkNTc0Y2E0OTE5NWQwODA1YjE5ZTM5ZDdmYTMwMzlmMzYyMTQ4NmExNDk3OTQyMmM0YTcxZmM1NmY=" target="_blank">Custom Tile Request Form.</a></strong></p>
      <p><strong>TILE REQUESTS WITH START DATES ON OR AFTER JANUARY 1, 2020 - Use this new tool.</strong></p>
      <p>Note: The standard tile creation process can take up to 30 days.</p>

      <div className="form-group mt-5">
        <label htmlFor="primaryAccountManager">Primary Account Manager</label>
        <select className="form-control" id="primaryAccountManager" value={accountManager} onChange={handleAccountManagerChange}>
          <option>Select an Account Manager</option>
          {accountManagerNames}
        </select>
      </div>

      <label>Will this be a brand new tile or would you like to search your tile history for previously used content?</label>
        <img className="tooltip-icon" src="images/tooltip.svg" data-toggle="tooltip" data-html="true" data-placement="auto" title="<strong>Net New: </strong><p>Create a brand new tile for your platform.</p><strong>Historical: </strong><p>Search your platform history and rerun or revise your tiles from previous program years.</p>"/>
      <div className="form-check">
        <input className="form-check-input" type="radio" name="netNewOrHistoricalRadios" id="netNew" value="NetNew" onChange={handleNewOrHistoricalChange} checked={newOrHistorical === 'NetNew'} />
        <label className="form-check-label" htmlFor="netNew">Net New</label>
      </div>
      <div className="form-check">
        <input className="form-check-input" type="radio" name="netNewOrHistoricalRadios" id="historical" value="Historical" onChange={handleNewOrHistoricalChange} checked={newOrHistorical === 'Historical'} />
        <label className="form-check-label" htmlFor="historical">Historical</label>
      </div>

    </section>
  );

}

export default Home;
