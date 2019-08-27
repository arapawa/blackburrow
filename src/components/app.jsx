import React, { useState, useEffect } from 'react';
import moment from 'moment';
import Airtable from 'airtable';
const base = new Airtable({ apiKey: 'keyCxnlep0bgotSrX' }).base('appN1J6yscNwlzbzq');

import Header from './header';
import Footer from './footer';
import Home from './home';
import NetNew from './net_new';
import Historical from './historical';
import ChallengeContent from './challenge_content';
import AdditionalDetails from './additional_details';
import ConfirmChallengeDetails from './confirm_challenge_details';
import StepConfiguration from './step_configuration';
import ConfirmSubmitModal from './confirm_submit_modal';
import EditorView from './editor_view';

/* globals $ */
function App() {
  const [calendar, setCalendar] = React.useState(null);
  const [step, setStep] = React.useState('Home');

  // Home
  const [accountManager, setAccountManager] = React.useState('');
  const [newOrHistorical, setNewOrHistorical] = React.useState('NetNew');

  // NetNew
  const [tileType, setTileType] = React.useState('One-Time Self-Report Challenge');
  const [startDate, setStateDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [pointValue, setPointValue] = React.useState('');

  // Historical
  const [limeadeChallenges, setLimeadeChallenges] = React.useState([]);
  const [historicalEdits, setHistoricalEdits] = React.useState('No');

  // ChallengeContent
  const [imageUrl, setImageUrl] = React.useState('http://via.placeholder.com/540x270');
  const [challengeTitle, setChallengeTitle] = React.useState('');
  const [activityText, setActivityText] = React.useState('');
  const [shortDescription, setShortDescription] = React.useState('');
  const [longDescription, setLongDescription] = React.useState('');

  // AdditionalDetails
  const [featuredActivity, setFeaturedActivity] = React.useState(false);
  const [targeting, setTargeting] = React.useState('Entire Population');
  const [specificDemographicText, setSpecificDemographicText] = React.useState('');

  const calendarHash = window.location.hash.slice(2, 16);

  // Make airtable calls when app starts
  React.useEffect(() => {
    const editing = window.location.hash.includes('edit');

    if (editing) {
      setStep('EditorView');
    }

    base('Calendars').select({
      filterByFormula: `{hash}='${calendarHash}'`
    }).eachPage((records, fetchNextPage) => {
      const calendar = records[0];

      setCalendar(calendar);

      fetchNextPage();
    }, (err) => {
      if (err) {
        console.error(err);
        return;
      }
    });

  }, []); // Pass empty array to only run once on mount

  function submitToWrike(record) {
    console.log(record);
    const today = moment().format('YYYY-MM-DD');
    const dueDate = moment().add(7, 'days').format('YYYY-MM-DD');
    const responsibleAm = 'KUAEFOGT'; // Meredith
    const editorUrl = `https://calendarbuilder.dev.adurolife.com/blackburrow/#/${calendarHash}/edit/${record.id}`;

    const data = {
      title: `Custom Challenge - ${calendar.fields['client']} - ${challengeTitle}`,
      description: `A new custom challenge has been created in Blackburrow... View it here: <a href="${editorUrl}">${editorUrl}</a>`,
      dates: {
        start: today,
        due: dueDate
      },
      responsibles: [responsibleAm]
    };

    $.ajax({
      type: 'POST',
      url: 'https://www.wrike.com/api/v4/folders/IEAAX5JZI4CCJNWS/tasks',
      data: JSON.stringify(data),
      dataType: 'json',
      contentType: 'application/json',
      headers: {
        Authorization: 'Bearer eyJ0dCI6InAiLCJhbGciOiJIUzI1NiIsInR2IjoiMSJ9.eyJkIjoie1wiYVwiOjc4MzY3MyxcImlcIjo2NDQ1NjI3LFwiY1wiOjQ2MTI5ODEsXCJ1XCI6NjM4OTA3MSxcInJcIjpcIlVTXCIsXCJzXCI6W1wiV1wiLFwiRlwiLFwiSVwiLFwiVVwiLFwiS1wiLFwiQ1wiLFwiQVwiLFwiTFwiXSxcInpcIjpbXSxcInRcIjowfSIsImlhdCI6MTU2NTEyMDE5Nn0.ZhznMJNLBBCqq43v4W0T_OFW-OJpBiXCLM6-7aJtiWU'
      }
    })
    .done(data => {
      const url = data.data[0].permalink;
      $('#confirmSubmitModal .modal-body').append(`<p>Wrike task created successfully: <a href="${url}">${url}</a></p>`);
    });
  }

  function submitToAirtable() {
    const acknowledgementChecked = $('#acknowledgement').prop('checked');
    const isFeatured = featuredActivity ? 'yes' : 'no';
    console.log('isFeatured = ' + isFeatured);
    const isTargeted = (targeting === 'Specific Demographic') ? 'yes' : 'no';
    console.log('isTargeted = ' + isTargeted);

    let customTileType = '';
    switch (newOrHistorical) {
      case 'NetNew':
        customTileType = 'Net New';
        break;
      case 'Historical':
        switch (historicalEdits) {
          case 'Yes':
            customTileType = 'Revised';
            break;
          case 'No':
            customTileType = 'Rerun';
            break;
        }
        break;
    }
    console.log('customTileType = ' + customTileType);

    $('#confirmSubmitModal').modal();
    if (acknowledgementChecked) {

      const phase = 'Phase 1';
      base('Challenges').create({
        'Title': challengeTitle,
        'Calendar': calendar.fields['hash'],
        'EmployerName': calendar.fields['client'],
        'Phase': phase,
        'Start date': startDate,
        'End date': endDate,
        'Verified': 'Self-Report',
        'Points': pointValue,
        'Total Points': pointValue,
        'Team Activity': 'no',
        'Reward Occurrence': 'Once',
        'Category': 'Health and Fitness',
        'Instructions': shortDescription,
        'More Information Html': longDescription,
        'Featured Activity': isFeatured,
        'Targeted Activity': isTargeted,
        'Targeting Notes': specificDemographicText,
        'Subgroup': null,
        'Targeting Column 1': null,
        'Targeting Value 1': '',
        'Targeting Column 2': null,
        'Targeting Value 2': '',
        'Targeting Column 3': null,
        'Targeting Value 3': '',
        'Custom Tile Type': customTileType,
        'Activity Tracking Type': 'Event',
        'Activity Goal': '',
        'Activity Goal Text': activityText,
        'Device Enabled': 'No',
        'Device Units': '',
        'Header Image': imageUrl,
        'Limeade Image Url': '',
        'Team Size Minimum': '',
        'Team Size Maximum': ''
      }, (err, record) => {
        if (err) {
          console.error(err);
          return;
        }

        $('#confirmSubmitModal .modal-body').html('<p>Challenge added successfully!</p>');

        // Submit to wrike using record details
        submitToWrike(record);

        // Update "updated" field in calendar with the current date
        base('Calendars').update(calendar.id, {
          'updated': moment().format('l')
        }, function(err, record) {
          if (err) {
            console.error(err);
            return;
          }
        });

      });

    } else {
      $('#confirmSubmitModal .modal-body').html('<p>You must check the acknowledgement to submit your request.</p>');
    }
  }

  // Basic validation (is a value present?)
  // TODO: this is currently just for NetNew as a demo, add for all Steps and improve
  function validatedFields() {
    const $startDate = $('#startDate');
    const $endDate = $('#endDate');
    const $pointValue = $('#pointValue');
    const $searchPreviousChallenge = $('#searchPreviousChallenge');
    const $challengeTitle = $('#challengeTitle');
    const $activityText = $('#activityText');
    const $shortDescription = $('#shortDescription');

    let allInputsAreValid = true;

    function validate($element) {
      if ($element.val()) {
        $element.removeClass('is-invalid');
      } else {
        $element.addClass('is-invalid');
        allInputsAreValid = false;
      }
    }

    switch (step) {
      case 'NetNew':
        validate($startDate);
        validate($endDate);
        validate($pointValue);
        break;
      case 'Historical':
        validate($searchPreviousChallenge);
        validate($startDate);
        validate($endDate);
        validate($pointValue);
        break;
      case 'ChallengeContent':
        validate($challengeTitle);
        validate($activityText);
        validate($shortDescription);
        break;
    }

    return allInputsAreValid;
  }

  function previousStep() {
    switch (step) {
      case 'NetNew':
        setStep('Home');
        break;
      case 'Historical':
        setStep('Home');
        break;
      case 'ChallengeContent':
        if (limeadeChallenges.length > 0) {
          setStep('Historical');
        } else {
          setStep('NetNew');
        }
        break;
      case 'AdditionalDetails':
        setStep('ChallengeContent');
        break;
      case 'ConfirmChallengeDetails':
        if (limeadeChallenges.length > 0) {
          setStep('Historical');
        } else {
          setStep('AdditionalDetails');
        }
        break;
      case 'StepConfiguration':
        setStep('ChallengeContent');
        break;
    }
  }

  function nextStep() {
    switch (step) {
      case 'Home':
        if (!calendar) {
          alert('Check your url, a calendar hash is required');
        } if (!accountManager) {
          alert('Select an Account Manager to Continue');
        } else {
          setStep(newOrHistorical);
        }
        break;
      case 'NetNew':
        if (validatedFields()) {
          setStep('ChallengeContent');
        }
        break;
      case 'Historical':
        if (validatedFields()) {
          if (historicalEdits === 'Yes') {
            setStep('ChallengeContent');
          } else if (historicalEdits === 'No') {
            setStep('ConfirmChallengeDetails');
          }
        }
        break;
      case 'ChallengeContent':
        switch (tileType) {
          case 'One-Time Self-Report Challenge':
          case 'Verified Challenge':
          case 'Informational Tile':
            if (validatedFields()) {
              setStep('AdditionalDetails');
            }
            break;
          case 'Steps Challenge':
            if (validatedFields()) {
              setStep('StepConfiguration');
            }
            break;
        }
        break;
      case 'AdditionalDetails':
        setStep('ConfirmChallengeDetails');
        break;
      case 'StepConfiguration':
        setStep('AdditionalDetails');
        break;
    }
  }

  function renderStep() {
    switch (step) {

      case 'Home':
        return <Home
          accountManager={accountManager}
          setAccountManager={setAccountManager}
          newOrHistorical={newOrHistorical}
          setNewOrHistorical={setNewOrHistorical}
        />;

      case 'NetNew':
        return <NetNew
          tileType={tileType}
          setTileType={setTileType}
          startDate={startDate}
          setStateDate={setStateDate}
          endDate={endDate}
          setEndDate={setEndDate}
          pointValue={pointValue}
          setPointValue={setPointValue}
        />;

      case 'Historical':
        return <Historical
          calendar={calendar}
          limeadeChallenges={limeadeChallenges}
          setLimeadeChallenges={setLimeadeChallenges}
          startDate={startDate}
          setStateDate={setStateDate}
          endDate={endDate}
          setEndDate={setEndDate}
          pointValue={pointValue}
          setPointValue={setPointValue}
          historicalEdits={historicalEdits}
          setHistoricalEdits={setHistoricalEdits}
          imageUrl={imageUrl}
          setImageUrl={setImageUrl}
          challengeTitle={challengeTitle}
          setChallengeTitle={setChallengeTitle}
          activityText={activityText}
          setActivityText={setActivityText}
          shortDescription={shortDescription}
          setShortDescription={setShortDescription}
          longDescription={longDescription}
          setLongDescription={setLongDescription}
        />;

      case 'ChallengeContent':
        return <ChallengeContent
          imageUrl={imageUrl}
          challengeTitle={challengeTitle}
          setChallengeTitle={setChallengeTitle}
          activityText={activityText}
          setActivityText={setActivityText}
          shortDescription={shortDescription}
          setShortDescription={setShortDescription}
          longDescription={longDescription}
          setLongDescription={setLongDescription}
        />;

      case 'AdditionalDetails':
        return <AdditionalDetails
          featuredActivity={featuredActivity}
          setFeaturedActivity={setFeaturedActivity}
          targeting={targeting}
          setTargeting={setTargeting}
          specificDemographicText={specificDemographicText}
          setSpecificDemographicText={setSpecificDemographicText}
          imageUrl={imageUrl}
          setImageUrl={setImageUrl}
          challengeTitle={challengeTitle}
          activityText={activityText}
          shortDescription={shortDescription}
          longDescription={longDescription}
        />;

      case 'ConfirmChallengeDetails':
        return <ConfirmChallengeDetails
          accountManager={accountManager}
          tileType={tileType}
          startDate={startDate}
          endDate={endDate}
          pointValue={pointValue}
          featuredActivity={featuredActivity}
          targeting={targeting}
          imageUrl={imageUrl}
          challengeTitle={challengeTitle}
          activityText={activityText}
          shortDescription={shortDescription}
          longDescription={longDescription}
        />;

      case 'StepConfiguration':
        return <StepConfiguration
          imageUrl={imageUrl}
          challengeTitle={challengeTitle}
          activityText={activityText}
          endDate={endDate}
          shortDescription={shortDescription}
          longDescription={longDescription}
        />;

      case 'EditorView':
        return <EditorView
          tileType={tileType}
          setTileType={setTileType}
          startDate={startDate}
          setStateDate={setStateDate}
          endDate={endDate}
          setEndDate={setEndDate}
          pointValue={pointValue}
          setPointValue={setPointValue}
          featuredActivity={featuredActivity}
          targeting={targeting}
          specificDemographicText={specificDemographicText}
          imageUrl={imageUrl}
          setImageUrl={setImageUrl}
          challengeTitle={challengeTitle}
          setChallengeTitle={setChallengeTitle}
          activityText={activityText}
          setActivityText={setActivityText}
          shortDescription={shortDescription}
          setShortDescription={setShortDescription}
          longDescription={longDescription}
          setLongDescription={setLongDescription}
        />;

      default:
        throw new Error(`Cannot render step: ${step}`);
    }
  }

  return (
    <div className="app">
      <Header />
      {renderStep()}
      <Footer step={step} previousStep={previousStep} nextStep={nextStep} submitToAirtable={submitToAirtable} />
      <ConfirmSubmitModal />
    </div>
  );
}

export default App;
