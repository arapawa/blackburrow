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
import ConfirmDeleteModal from './confirm_delete_modal';
import ConfirmSubmitModal from './confirm_submit_modal';
import EditorView from './editor_view';
import UploadModal from './upload_modal';
import SaveNotification from './save_notification';

/* globals $ */
function App() {
  const [calendar, setCalendar] = React.useState(null);
  const [step, setStep] = React.useState('Home');

  // Home
  const [accountManager, setAccountManager] = React.useState('');
  const [accountManagerWrikeId, setAccountManagerWrikeId] = React.useState('');
  const [accountManagers, setAccountManagers] = React.useState([]);
  const [newOrHistorical, setNewOrHistorical] = React.useState('NetNew');

  // NetNew
  const [tileType, setTileType] = React.useState('One-Time Self-Report Challenge');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [pointValue, setPointValue] = React.useState('');

  // Historical
  const [limeadeChallenges, setLimeadeChallenges] = React.useState([]);
  const [historicalEdits, setHistoricalEdits] = React.useState('No');
  const [weekly, setWeekly] = React.useState(false);

  // ChallengeContent
  const [imageUrl, setImageUrl] = React.useState('http://via.placeholder.com/2000x1000');
  const [challengeTitle, setChallengeTitle] = React.useState('');
  const [activityText, setActivityText] = React.useState('');
  const [shortDescription, setShortDescription] = React.useState('');
  const [longDescription, setLongDescription] = React.useState('');

  // StepConfiguration
  const [individualOrTeam, setIndividualOrTeam] = React.useState('Individual');
  const [teamMin, setTeamMin] = React.useState();
  const [teamMax, setTeamMax] = React.useState();
  const [activityGoalNumber, setActivityGoalNumber] = React.useState('');

  // AdditionalDetails
  const [featuredActivity, setFeaturedActivity] = React.useState(false);
  const [maxOccurrence, setMaxOccurrence] = React.useState('1');
  const [targeting, setTargeting] = React.useState('Entire Population');
  const [specificDemographicText, setSpecificDemographicText] = React.useState('');
  
  // ConfirmChallengeDetails
  const [notes, setNotes] = React.useState('');
  const [contactName, setContactName] = React.useState('');
  const [contactEmail, setContactEmail] = React.useState('');

  // EditorView
  const [challengeType, setChallengeType] = React.useState('');
  const [targetingType, setTargetingType] = React.useState('');
  const [subgroup, setSubgroup] = React.useState('');
  const [targetingColumn1, setTargetingColumn1] = React.useState('');
  const [targetingValue1, setTargetingValue1] = React.useState('');
  const [targetingColumn2, setTargetingColumn2] = React.useState('');
  const [targetingValue2, setTargetingValue2] = React.useState('');
  const [targetingColumn3, setTargetingColumn3] = React.useState('');
  const [targetingValue3, setTargetingValue3] = React.useState('');


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

    const wrikeStartDate = moment(startDate).subtract(28, 'days').format('YYYY-MM-DD');
    const wrikeDueDate = moment(wrikeStartDate).add(21, 'days').format('YYYY-MM-DD');
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

    const calendarUrl = `https://calendarbuilder.dev.adurolife.com/calendar-builder/#/${calendarHash}`;
    const ctrtUrl = `https://calendarbuilder.dev.adurolife.com/ctrt/#/${calendarHash}`;
    const editorUrl = `https://calendarbuilder.dev.adurolife.com/ctrt/#/${calendarHash}/edit/${record.id}`;

    const description = `
      <p><strong>Client Name:</strong> ${calendar.fields['client']}</p>
      <p><strong>Client Contact Name:</strong> ${contactName}</p>
      <p><strong>Client Contact Email:</strong> <a href="mailto:${contactEmail}"> ${contactEmail}</a></p>
      <p><strong>Account Manager:</strong> ${accountManager}</p>
      <br/>
      <p><strong>Tile Type:</strong> ${tileType}</p>
      <p><strong>Max Occurrence:</strong> ${maxOccurrence}</p>
      <p><strong>Net-New or Historical:</strong> ${customTileType}</p>
      <p><strong>Tile Name:</strong> ${challengeTitle}</p>
      <p><strong>Start Date:</strong> ${moment(startDate).format('L')}</p>
      <p><strong>End Date:</strong> ${moment(endDate).format('L')}</p>
      <p><strong>Notes:</strong> ${notes}</p>
      <br/>
      <p><strong>Editor View:</strong> <a href="${editorUrl}">${editorUrl}</a></p>
      <p><strong>Client Challenge Calendar:</strong> <a href="${calendarUrl}">${calendarUrl}</a></p>
      <p><strong>Tile Image:</strong> <a href="${imageUrl}">${imageUrl}</p>
      <br/>
      <p><strong>1) WAIT! STOP! Before moving on...</strong></p>
      <p>If tile type is: "Verified Challenge" AND "Revised" or "Rerun", &#64; the AM with the below message:</p><br/>
      <p><em>"A request was received to rerun or revise a historical tile for your client. Please answer this question:</em></p><br/>
      <p><em>Can this tile be made into a Partner Challenge or must it be configured as a classic CIE?</em></p><br/>
      <p><em>The following examples would require a tile to be configured as a CIE:</em></p>
      <ol>
        <li><em>ID 7: Complete a Health Screening</em></li>
        <li><em>ID 10: Well-being Assessment</em></li>
        <li><em>RAS Programs (i.e. Breathe Easy, My Health Matters, etc.)</em></li>
        <li><em>Any CIE tied to an integration or workflow (i.e. Naturally Slim)</em></li>
      </ol>
      <p><em>Thank you for clarifying!""</em></p><br/>
      <p>If Partner Challenge, continue with process as normal. <br/>If CIE, review the content and add this task to the WebConfig folder.</p>
    `;

    const data = {
      title: `${calendar.fields['client']} - ${customTileType} - ${tileType} - ${challengeTitle} - ${moment(startDate).format('L')}`,
      description: description,
      dates: {
        start: wrikeStartDate,
        due: wrikeDueDate
      },
      followers: [accountManagerWrikeId],
      parents: ['IEAAX5JZI4LYLGP4', 'IEAAX5JZI4CCJNWS'], // add task to Web Config folder, which apparently is called a Parent
      responsibles: [],
      status: 'Active',
    };

    $.ajax({
      type: 'POST',
      url: 'https://www.wrike.com/api/v4/folders/IEAAX5JZI4LYLGP4/tasks',
      data: JSON.stringify(data),
      dataType: 'json',
      contentType: 'application/json',
      headers: {
        Authorization: 'Bearer eyJ0dCI6InAiLCJhbGciOiJIUzI1NiIsInR2IjoiMSJ9.eyJkIjoie1wiYVwiOjc4MzY3MyxcImlcIjo2NDQ1NjI3LFwiY1wiOjQ2MTI5ODEsXCJ1XCI6NjM4OTA3MSxcInJcIjpcIlVTXCIsXCJzXCI6W1wiV1wiLFwiRlwiLFwiSVwiLFwiVVwiLFwiS1wiLFwiQ1wiLFwiQVwiLFwiTFwiXSxcInpcIjpbXSxcInRcIjowfSIsImlhdCI6MTU2NTEyMDE5Nn0.ZhznMJNLBBCqq43v4W0T_OFW-OJpBiXCLM6-7aJtiWU'
      }
    })
    .done(data => {
      const url = data.data[0].permalink;
      const confirmationText = `
        <p>View it in your <a href="${calendarUrl}" target="_blank">Calendar Builder</a> or submit <a href="${ctrtUrl}" target="_blank">another request</a>.</p>
      `;
      $('#confirmSubmitModal .modal-body').append(confirmationText);
    });
  }

  function openDeleteConfirmModal() {
    // open confirmation modal
    $('#confirmDeleteModal').modal();
    $('#confirmDeleteModal .modal-footer .btn-danger').off('click');
    $('#confirmDeleteModal .modal-footer .btn-danger').click(() => deleteChallengeFromAirtable());
  }

  function deleteChallengeFromAirtable() {
    // get recordId to update
    const recordId = window.location.hash.slice(22);

    // Make update in Airtable
    $('#saveNotification').show().html('Saving...');
    base('Challenges').destroy(recordId, (err, deletedRecord) => {
      if (err) {
        console.error(err);
        return;
      }
      $('#saveNotification').html('Deleted ' + challengeTitle).delay(800).fadeOut(2000);
      console.log(`Deleted ${challengeTitle} - ${recordId}`);
    });

    // close the delete modal
    $('#confirmDeleteModal').modal('hide');

    // TODO: clear out the page, record has been deleted
 
  }

  function submitToAirtable() {
    const acknowledgementChecked = $('#acknowledgement').prop('checked');
    const rewardOccurrence = weekly === true ? 'Weekly' : 'Once';
    const isFeatured = featuredActivity ? 'yes' : 'no';
    const isTargeted = (targeting === 'Specific Demographic') ? 'yes' : 'no';
    const activityGoal = activityGoalNumber ? activityGoalNumber.toString() : '';

    let activityTrackingType = '';
    switch (tileType) {
      case 'One-Time Self-Report Challenge':
      case 'Verified Challenge':
      case 'Informational Tile':
        activityTrackingType = 'Event';
        break;
      case 'Weekly Days':
        activityTrackingType = 'Days';
        break;
      case 'Weekly Units':
      case 'Steps Challenge':
        activityTrackingType = 'Units';
        break;
    }

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
    
    let verified = '';
    switch (tileType) {
      case 'One-Time Self-Report Challenge':
      case 'Weekly Days':
      case 'Weekly Units':
      case 'Steps Challenge':
        verified = 'Self-Report';
        break;
      case 'Verified Challenge':
      case 'Informational Tile':
        verified = 'Points Upload';
        break;
    }

    $('#confirmSubmitModal').modal();
    if (acknowledgementChecked && contactName && contactEmail) {

      const phase = 'Yearlong';
      base('Challenges').create({
        'Title': challengeTitle,
        'Calendar': calendar.fields['hash'],
        'EmployerName': calendar.fields['client'],
        'Phase': phase,
        'Start date': startDate,
        'End date': endDate,
        'Verified': verified,
        'Points': pointValue,
        'Total Points': pointValue,
        'Team Activity': individualOrTeam === 'Team' ? 'yes' : 'no',
        'Reward Occurrence': rewardOccurrence,
        'Category': 'NA',
        'Instructions': shortDescription,
        'More Information Html': longDescription,
        'Featured Activity': isFeatured,
        'Comment': notes,
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
        'Activity Tracking Type': activityTrackingType,
        'Activity Goal': activityGoal,
        'Activity Goal Text': activityText,
        'Device Enabled': tileType === 'Steps Challenge' ? 'yes' : 'no',
        'Device Units': tileType === 'Steps Challenge' ? 'steps' : '',
        'Header Image': imageUrl,
        'Limeade Image Url': newOrHistorical === 'Historical' ? imageUrl : '',
        'Team Size Minimum': individualOrTeam === 'Team' ? teamMin.toString() : '',
        'Team Size Maximum': individualOrTeam === 'Team' ? teamMax.toString() : ''
      }, (err, record) => {
        if (err) {
          console.error(err);
          return;
        }

        $('#confirmSubmitModal .modal-body').html('<p>Your request has been received!</p>');

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

    } else if (acknowledgementChecked === false) {
      $('#confirmSubmitModal .modal-body').html('<p>You must check the acknowledgement to submit your request.</p>');
    } else {
      $('#confirmSubmitModal .modal-body').html('<p>Please enter your name and email.</p>');
    }
  }

  // Editor View submission function
  function submitEditsToAirtable() {
    // get recordId to update
    const recordId = window.location.hash.slice(22);

    // create translation variables
    const rewardOccurrence = weekly === true ? 'Weekly' : 'Once';
    const isFeatured = featuredActivity ? 'yes' : 'no';
    const isTargeted = (targeting === 'Specific Demographic') ? 'yes' : 'no';
    const activityGoal = activityGoalNumber ? activityGoalNumber.toString() : '';

    let activityTrackingType = '';
    switch (tileType) {
      case 'One-Time Self-Report Challenge':
      case 'Verified Challenge':
      case 'Informational Tile':
        activityTrackingType = 'Event';
        break;
      case 'Weekly Days':
        activityTrackingType = 'Days';
        break;
      case 'Weekly Units':
      case 'Steps Challenge':
        activityTrackingType = 'Units';
        break;
    }

    let verified = '';
    switch (tileType) {
      case 'One-Time Self-Report Challenge':
      case 'Weekly Days':
      case 'Weekly Units':
      case 'Steps Challenge':
        verified = 'Self-Report';
        break;
      case 'Verified Challenge':
      case 'Informational Tile':
        verified = 'Points Upload';
        break;
    }

    // update airtable record
    base('Challenges').update(recordId, 
      {
        'Title': challengeTitle,
        'Start date': startDate,
        'End date': endDate,
        'Verified': verified,
        'Team Activity': individualOrTeam === 'Team' ? 'yes' : 'no',
        'Team Size Minimum': teamMin,
        'Team Size Maximum': teamMax,
        'Reward Occurrence': rewardOccurrence,
        'Points': pointValue,
        'Total Points': pointValue,
        'Device Enabled': tileType === 'Steps Challenge' ? 'yes' : 'no',
        'Category': 'NA',
        'Activity Tracking Type': activityTrackingType,
        'Activity Goal': activityGoal,
        'Activity Goal Text': activityText,
        'Device Units': tileType === 'Steps Challenge' ? 'steps' : '',
        'Header Image': imageUrl,
        'Limeade Image Url': imageUrl,
        'Instructions':shortDescription,
        'More Information Html': longDescription,
        'Featured Activity': isFeatured,
        'Targeted Activity': isTargeted,
        'Targeting Notes': specificDemographicText,
        'Subgroup': targetingType === 'Subgroups' ? subgroup : '',
        'Targeting Column 1': targetingType === 'Tags' ? targetingColumn1 : '',
        'Targeting Value 1': targetingType === 'Tags' ? targetingValue1 : '',
        'Targeting Column 2': targetingType === 'Tags' ? targetingColumn2 : '',
        'Targeting Value 2': targetingType === 'Tags' ? targetingValue2 : '',
        'Targeting Column 3': targetingType === 'Tags' ? targetingColumn3 : '',
        'Targeting Value 3': targetingType === 'Tags' ? targetingValue3 : ''
      }, function(err, record) {
      if (err) {
        console.error(err);
        return;
      }
      console.log('Updated', record);
      $('#saveNotification').html('Saved ' + challengeTitle).delay(800).fadeOut(2000);
    });
  }

  // BEGIN upload function
  function uploadChallenge() {
    // TODO: pull in the client for later getting the LimeadeAccessToken, for now:
    const client = 'Limeadedemorb';
    const limeadeAccessToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Ik02MkhTLUJHY3J2WEhmamdSRFB2bHZOem5GbyIsImtpZCI6Ik02MkhTLUJHY3J2WEhmamdSRFB2bHZOem5GbyJ9.eyJjbGllbnRfaWQiOiJpbnRlcm5hbGNsaWVudCIsInNjb3BlIjpbImFwaWFjY2VzcyIsIm9wZW5pZCIsInBpaWlkZW50aXR5Il0sInN1YiI6IjU3NDU4NDAiLCJhbXIiOiJwYXNzd29yZCIsImF1dGhfdGltZSI6MTU2MzM4ODI4NSwiaWRwIjoiaWRzcnYiLCJuYW1lIjoiTGltZWFkZWRlbW9yYkFkbWluIiwibGltZWFkZV9hY2NvdW50X2lkIjoiNTc0NTg0MCIsImVtcGxveWVyaWQiOiIxMDY2ODciLCJlbXBsb3llcl9pZCI6IjEwNjY4NyIsInJvbGUiOlsiQWRtaW4iLCJQcm9ncmFtQWRtaW4iXSwiZW1wbG95ZXJuYW1lIjoiTGltZWFkZWRlbW9yYiIsImdpdmVuX25hbWUiOiJMaW1lYWRlZGVtb3JiIiwiZmFtaWx5X25hbWUiOiJBZG1pbiIsImVtYWlsIjoiTGltZWFkZWRlbW9yYkFkbWluQGFkdXJvbGlmZS5jb20iLCJpc3MiOiJ3d3cubGltZWFkZS5jb20iLCJhdWQiOiJ3d3cubGltZWFkZS5jb20vcmVzb3VyY2VzIiwiZXhwIjoxNTk0OTI0Mjg1LCJuYmYiOjE1NjMzODgyODV9.f5OGrtwsk1x9zJLJZtNvT5AWZHoLoxgQKyhLLFiLx7ZMaxXL9UPA90nJdpZZH0lYaUSyBB9jjujoYLtZvE8KQN-fknw4xy6aLExwv8tZDRKWOZXDT1mqRI2VNtyhntksKrxaKcp7LTpVWFlzJ8RxuTpCp3hSVSTOo6FipW6EDnpC9lwrHWE5tPn05rDpIcgUxvZ7UPgZ4LEolUmw8U7plfI1_e6Ry69lBHoWZC9YMHUxEM1RqE03mrboHOE_8oLC6tWdY8CfaDgHCU4D4Qa9DPSjNEoy0ieFPyTrHQXW5A74fLoWoF_bvu3wpSIe5IFWvKtH9DzJZYrru1L34lhiCw';
    const clientDomain = 'https://limeadedemorb.mywellmetrics.com/admin/program-designer/activities/activity/';

    // Open the modal
    $('#uploadModal').modal();
    $('#uploadModal .modal-body').html('');

    // create some variables for ease of use when uploading
    let isPartner = false;
    if (tileType === 'Verified Challenge' || tileType === 'Informational Tile') {
      isPartner = true;
    } else {
      isPartner = false;
    }

    let frequency = '';
    if (tileType === 'Steps Challenge') {
      frequency = 'Daily';
    } else if (weekly === true) {
      frequency = 'Weekly'; // this order is intentional, since Weekly Steps have Frequency of Weekly
    } else {
      frequency = 'None';
    }

    // most of the time, Activity Type is the activityText, unless it's a weekly units non-device challenge
    let activityType = '';
    if (tileType === 'Weekly Units') {
      activityType = '';
    } else {
      activityType = activityText;
    }
    
    let amountUnit = 'times';
    switch (tileType) {
      case 'Steps Challenge':
        amountUnit = 'steps';
        break;
      case 'Weekly Units':
        amountUnit = activityText;
        break;
      case 'One-Time Self-Report Challenge':
      case 'Verified Challenge':
      case 'Informational Tile':
      case 'Weekly Days':
        amountUnit = 'times';
    }


    // TODO: update data to be accurate and dynamic
    const data = {
      'AboutChallenge': longDescription,
      'ActivityReward': {
        'Type': 'IncentivePoints',
        'Value': pointValue
      },
      'ActivityType': activityType,
      'AmountUnit': amountUnit,
      'ButtonText': isPartner ? 'CLOSE' : '',
      'ChallengeLogoThumbURL': imageUrl,
      'ChallengeLogoURL': imageUrl,
      'ChallengeTarget': activityGoalNumber,
      'ChallengeType': challengeType,
      'Dimensions': [],
      'DisplayInProgram': startDate === moment(Date) ? true : false,  // sets true if the challenge starts today
      'DisplayPriority': null,
      'EndDate': endDate,
      'EventCode': '',
      'Frequency': frequency,
      'IsDeviceEnabled': tileType === 'Steps Challenge' ? true : false,
      'IsFeatured': featuredActivity === 'yes' ? true : null,
      'FeaturedData': {
        'Description': featuredActivity === 'yes' ? shortDescription : null,
        'ImageUrl': featuredActivity === 'yes' ? imageUrl : null
      },
      'IsSelfReportEnabled': isPartner ? false : true,
      'IsTeamChallenge': individualOrTeam === 'Team' ? true : false,
      'Name': challengeTitle,
      'PartnerId': isPartner ? 1 : 0, 
      'ShortDescription': shortDescription,
      'ShowExtendedDescription': isPartner ? true : false,
      'ShowWeeklyCalendar': false,
      'StartDate': startDate,
      'TargetUrl': isPartner ? '/Home?sametab=true' : '',
      'Targeting': [
        // {
        //   'SubgroupId': subgroup ? subgroup : 0, // if no subgroup, use 0 aka none
        //   'Name': '', // let's hope this is optional since How would we know the Subgroup Name?
        //   'IsImplicit': targetingType ? true : null, // I don't know what this does. I see it as true for tags and false for subgroups
        //   'IsPHI': false,
        //   'Tags': [
        //     {
        //       'TagName': targetingColumn1 ? targetingColumn1 : '',
        //       'TagValues': [
        //         targetingValue1 ? targetingValue1.split('|').trim() : '' // splitting tags on the | like Limeade, also trimming out whitespace just in case
        //       ]
        //     },
        //     {
        //       'TagName': targetingColumn2 ? targetingColumn2 : '',
        //       'TagValues': [
        //         targetingValue2 ? targetingValue2.split('|').trim() : ''
        //       ]
        //     },
        //     {
        //       'TagName': targetingColumn3 ? targetingColumn3 : '',
        //       'TagValues': [
        //         targetingValue3 ? targetingValue3.split('|').trim() : ''
        //       ]
        //     }
        //   ]
        // }
      ],
      'TeamSize': individualOrTeam === 'Team' ? { MaxTeamSize: teamMax, MinTeamSize: teamMin } : null
    };
    console.log({ data });

    $.ajax({
      url: 'https://api.limeade.com/api/admin/activity',
      type: 'POST',
      dataType: 'json',
      data: JSON.stringify(data),
      headers: {
        Authorization: 'Bearer ' + limeadeAccessToken
      },
      contentType: 'application/json; charset=utf-8'
    }).done((result) => {
        $('#uploadModal .modal-body').html(`
          <div class="alert alert-success" role="alert">
            <p>Uploaded ${challengeTitle} for <strong>${client}</strong></p>
            <p class="mb-0"><strong>Challenge Id</strong></p>
            <p><a href=${clientDomain + result.Data.ChallengeId} target="_blank">${result.Data.ChallengeId}</a></p>
          </div>
        `);
        console.log(result.Data);
    }).fail((xhr, textStatus, error) => {
      console.error(xhr.responseText);
    });
  }
  // END upload function

  // Basic validation (is a value present?)
  function validatedFields() {
    const $startDate = $('#startDate');
    const $endDate = $('#endDate');
    const $pointValue = $('#pointValue');
    const $searchPreviousChallenge = $('#searchPreviousChallenge');
    const $challengeTitle = $('#challengeTitle');
    const $activityText = $('#activityText');
    const $shortDescription = $('#shortDescription');
    const $specificDemographicText = $('#targetingDetails');

    let allInputsAreValid = true;

    function validate($element) {
      if ($element.val()) {
        $element.removeClass('is-invalid');
      } else {
        $element.addClass('is-invalid');
        allInputsAreValid = false;
      }
    }

    // validation for start and end date timing
    function validateStartIsBeforeEndDate() {
      if (moment(endDate).isBefore(startDate)) {
        alert('Error: The Start Date must be before the End Date.');
        $startDate.addClass('is-invalid');
        $endDate.addClass('is-invalid');
        allInputsAreValid = false;
      } else {
        $startDate.removeClass('is-invalid');
        $endDate.removeClass('is-invalid');
      }
    }

    switch (step) {
      case 'NetNew':
        validate($startDate);
        validate($endDate);
        validate($pointValue);
        validateStartIsBeforeEndDate();
        break;
      case 'Historical':
        validate($searchPreviousChallenge);
        validate($startDate);
        validate($endDate);
        validate($pointValue);
        validateStartIsBeforeEndDate();
        break;
      case 'ChallengeContent':
        validate($challengeTitle);
        validate($activityText);
        validate($shortDescription);
        break;
      case 'AdditionalDetails':
        targeting === 'Specific Demographic' ? validate($specificDemographicText) : '';
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
      case 'StepConfiguration':
        if (limeadeChallenges.length > 0) {
          setStep('Historical');
        } else {
          setStep('NetNew');
        }
        break;
      case 'ChallengeContent':
        if (limeadeChallenges.length > 0) {
          switch (tileType) {
            case 'One-Time Self-Report Challenge':
            case 'Verified Challenge':
            case 'Informational Tile':
            case 'Weekly Days':
              setStep('Historical');
              break;
            case 'Steps Challenge':
              setStep('StepConfiguration');
              break;
          }
        } else {
          switch (tileType) {
            case 'One-Time Self-Report Challenge':
            case 'Verified Challenge':
            case 'Informational Tile':
            case 'Weekly Days':
              setStep('NetNew');
              break;
            case 'Steps Challenge':
              setStep('StepConfiguration');
              break;
          }
        }
        break;
      case 'AdditionalDetails':
        setStep('ChallengeContent');
        break;
      case 'ConfirmChallengeDetails':
        if (limeadeChallenges.length > 0) {
          if (historicalEdits === 'Yes') {
            setStep('AdditionalDetails');
          } else if (historicalEdits === 'No') {
            setStep('Historical');
          }
        } else {
          setStep('AdditionalDetails');
        }
        break;
      
    }
  }

  function nextStep() {
    switch (step) {
      case 'Home':
        if (!calendar || !accountManager) {
          if (!calendar) {
            alert('Check your url, a calendar ID is required');
          } 
          if (!accountManager) {
            alert('Select an Account Manager to Continue');
          }
        } else {
            setStep(newOrHistorical);
          }
        
        break;
      case 'NetNew':
        if (validatedFields()) {
          switch (tileType) {
            case 'One-Time Self-Report Challenge':
            case 'Verified Challenge':
            case 'Informational Tile':
            case 'Weekly Days':
              if (validatedFields()) {
                setStep('ChallengeContent');
              }
              break;
            case 'Steps Challenge':
              if (validatedFields()) {
                setStep('StepConfiguration');
              }
              break;
          }
        }
        break;
      case 'Historical':
        if (validatedFields()) {
          if (historicalEdits === 'Yes') {
            switch (tileType) {
              case 'One-Time Self-Report Challenge':
              case 'Verified Challenge':
              case 'Informational Tile':
              case 'Weekly Days':
              case 'Weekly Units':
                if (validatedFields()) {
                  setStep('ChallengeContent');
                }
                break;
              case 'Steps Challenge':
                if (validatedFields()) {
                  setStep('StepConfiguration');
                }
                break;
            }
          } else if (historicalEdits === 'No') {
            setStep('ConfirmChallengeDetails');
          }
        }
        break;
      case 'StepConfiguration':
        setStep('ChallengeContent');
        break;
      case 'ChallengeContent':
        setStep('AdditionalDetails');
        break;
      case 'AdditionalDetails':
        if (validatedFields()) {
          setStep('ConfirmChallengeDetails');
        }
        break;
    }
    // force the user to the top of the page at each step
    window.scrollTo(0, 0);
  }

  function renderStep() {
    switch (step) {

      case 'Home':
        return <Home
          accountManager={accountManager}
          setAccountManager={setAccountManager}
          accountManagerWrikeId={accountManagerWrikeId}
          setAccountManagerWrikeId={setAccountManagerWrikeId}
          accountManagers={accountManagers}
          setAccountManagers={setAccountManagers}
          newOrHistorical={newOrHistorical}
          setNewOrHistorical={setNewOrHistorical}
        />;

      case 'NetNew':
        return <NetNew
          tileType={tileType}
          setTileType={setTileType}
          activityText={activityText}
          setActivityText={setActivityText}
          startDate={startDate}
          setStartDate={setStartDate}
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
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          weekly={weekly}
          setWeekly={setWeekly}
          pointValue={pointValue}
          setPointValue={setPointValue}
          historicalEdits={historicalEdits}
          setHistoricalEdits={setHistoricalEdits}
          tileType={tileType}
          setTileType={setTileType}
          activityGoalNumber={activityGoalNumber}
          setActivityGoalNumber={setActivityGoalNumber}
          individualOrTeam={individualOrTeam}
          setIndividualOrTeam={setIndividualOrTeam}
          setTeamMin={setTeamMin}
          setTeamMax={setTeamMax}
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
          tileType={tileType}
          weekly={weekly}
          setWeekly={setWeekly}
          imageUrl={imageUrl}
          challengeTitle={challengeTitle}
          setChallengeTitle={setChallengeTitle}
          activityText={activityText}
          setActivityText={setActivityText}
          activityGoalNumber={activityGoalNumber}
          individualOrTeam={individualOrTeam}
          shortDescription={shortDescription}
          setShortDescription={setShortDescription}
          longDescription={longDescription}
          setLongDescription={setLongDescription}
        />;

      case 'AdditionalDetails':
        return <AdditionalDetails
          tileType={tileType}
          weekly={weekly}
          setWeekly={setWeekly}
          featuredActivity={featuredActivity}
          setFeaturedActivity={setFeaturedActivity}
          maxOccurrence={maxOccurrence}
          setMaxOccurrence={setMaxOccurrence}
          individualOrTeam={individualOrTeam}
          targeting={targeting}
          setTargeting={setTargeting}
          specificDemographicText={specificDemographicText}
          setSpecificDemographicText={setSpecificDemographicText}
          imageUrl={imageUrl}
          setImageUrl={setImageUrl}
          challengeTitle={challengeTitle}
          activityText={activityText}
          activityGoalNumber={activityGoalNumber}
          shortDescription={shortDescription}
          longDescription={longDescription}
        />;

      case 'ConfirmChallengeDetails':
        return <ConfirmChallengeDetails
          accountManager={accountManager}
          tileType={tileType}
          weekly={weekly}
          setWeekly={setWeekly}
          individualOrTeam={individualOrTeam}
          teamMin={teamMin}
          teamMax={teamMax}
          startDate={startDate}
          endDate={endDate}
          pointValue={pointValue}
          featuredActivity={featuredActivity}
          maxOccurrence={maxOccurrence}
          targeting={targeting}
          specificDemographicText={specificDemographicText}
          contactName={contactName}
          setContactName={setContactName}
          contactEmail={contactEmail}
          setContactEmail={setContactEmail}
          notes={notes}
          setNotes={setNotes}
          imageUrl={imageUrl}
          challengeTitle={challengeTitle}
          activityText={activityText}
          activityGoalNumber={activityGoalNumber}
          shortDescription={shortDescription}
          longDescription={longDescription}
        />;

      case 'StepConfiguration':
        return <StepConfiguration
          tileType={tileType}
          weekly={weekly}
          setWeekly={setWeekly}
          imageUrl={imageUrl}
          challengeTitle={challengeTitle}
          activityText={activityText}
          activityGoalNumber={activityGoalNumber}
          setActivityGoalNumber={setActivityGoalNumber}
          endDate={endDate}
          shortDescription={shortDescription}
          longDescription={longDescription}
          individualOrTeam={individualOrTeam}
          setIndividualOrTeam={setIndividualOrTeam}
          setTeamMin={setTeamMin}
          setTeamMax={setTeamMax}
        />;

      case 'EditorView':
        return <EditorView
          tileType={tileType}
          setTileType={setTileType}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          pointValue={pointValue}
          setPointValue={setPointValue}
          weekly={weekly}
          setWeekly={setWeekly}
          individualOrTeam={individualOrTeam}
          setIndividualOrTeam={setIndividualOrTeam}
          teamMin={teamMin}
          setTeamMin={setTeamMin}
          teamMax={teamMax}
          setTeamMax={setTeamMax}
          featuredActivity={featuredActivity}
          setFeaturedActivity={setFeaturedActivity}
          targeting={targeting}
          setTargeting={setTargeting}
          specificDemographicText={specificDemographicText}
          setSpecificDemographicText={setSpecificDemographicText}
          notes={notes}
          setNotes={setNotes}
          challengeType={challengeType}
          setChallengeType={setChallengeType}
          targetingType={targetingType}
          setTargetingType={setTargetingType}
          subgroup={subgroup}
          setSubgroup={setSubgroup}
          targetingColumn1={targetingColumn1}
          setTargetingColumn1={setTargetingColumn1}
          targetingValue1={targetingValue1}
          setTargetingValue1={setTargetingValue1}
          targetingColumn2={targetingColumn2}
          setTargetingColumn2={setTargetingColumn2}
          targetingValue2={targetingValue2}
          setTargetingValue2={setTargetingValue2}
          targetingColumn3={targetingColumn3}
          setTargetingColumn3={setTargetingColumn3}
          targetingValue3={targetingValue3}
          setTargetingValue3={setTargetingValue3}
          imageUrl={imageUrl}
          setImageUrl={setImageUrl}
          challengeTitle={challengeTitle}
          setChallengeTitle={setChallengeTitle}
          activityText={activityText}
          setActivityText={setActivityText}
          activityGoalNumber={activityGoalNumber}
          setActivityGoalNumber={setActivityGoalNumber}
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
      <SaveNotification />
      <Header />
      {renderStep()}
      <Footer step={step} previousStep={previousStep} nextStep={nextStep} openDeleteConfirmModal={openDeleteConfirmModal} submitToAirtable={submitToAirtable} submitEditsToAirtable={submitEditsToAirtable} uploadChallenge={uploadChallenge} />
      <ConfirmDeleteModal />
      <ConfirmSubmitModal deleteChallengeFromAirtable={deleteChallengeFromAirtable} />
      <UploadModal />
    </div>
  );
}

export default App;
