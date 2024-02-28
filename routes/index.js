const express = require('express');
const router = express.Router();
const fs = require('fs');
const Papa = require('papaparse');

const SPRINT_NUMBER = '22';
const TEAM = 'Bullseye';
const SPRINT = `Sprint ${SPRINT_NUMBER}`;
const DATES = '14th Feb 2024 to 28th Feb 2024';

const COL_INDEX = {
  COMPONENT: 0,
  TYPE: 1,
  SUMMARY: 2,
  KEY: 3,
  ID: 4, // not used
  STATUS: 5,
  EPIC_KEY: 6,
};

const EPIC_MAP = {
  'DMP-629': 'Admin portal',
  'DMP-603': 'Admin portal',
  'DMP-606': 'Admin Portal',
  'DMP-9': 'Audio API and Service',
  'DMP-12': 'Audio Transformation Service',
  'DMP-21': 'Case audit service',
  'DMP-8': 'Case data API and Service',
  'DMP-521': 'Daily list',
  'DMP-14': 'DARTS Portal (other)',
  'DMP-17': 'Data management',
  'DMP-6': 'Data migration',
  'DMP-7': 'Events API',
  'DMP-22': 'Notification framework',
  'DMP-16': 'Retention',
  'DMP-33': 'Tech tasks / Misc',
  'DMP-487': 'Tech tasks / Misc',
  'DMP-13': 'Transcription service',
  'DMP-215': 'Annotations',
  'DMP-20': 'Monitoring service',
  'DMP-11': 'Authentication - External Users',
  'DMP-441': 'Authorisation Service'
};

router.get('/', function(_, res) {
  const file = fs.readFileSync(`sprint${SPRINT_NUMBER}.csv`);
  const data = Papa.parse(file.toString()).data;

  const epics = {};
  data.forEach((entry, idx) => {
    if (idx === 0 || entry.length < 7) {
      return;
    }
    const item = {
      isBackend: entry[COL_INDEX.COMPONENT].indexOf('Backend') >= 0,
      isFrontend: entry[COL_INDEX.COMPONENT].indexOf('Frontend') >= 0,
      type: entry[COL_INDEX.TYPE],
      summary: entry[COL_INDEX.SUMMARY],
      key: entry[COL_INDEX.KEY],
      status: entry[COL_INDEX.STATUS],
      epic: EPIC_MAP[entry[COL_INDEX.EPIC_KEY]] || entry[COL_INDEX.EPIC_KEY],
    };
    if (epics[item.epic]) {
      epics[item.epic].push(item);
    } else {
      epics[item.epic] = [item];
    }
  });

  Object.keys(epics).forEach((epic) => epics[epic].sort((a, b) => {
    if (a.isFrontend && b.isBackend) return 1;
    if (a.isBackend && b.isFrontend) return -1;
    return a.status.replace('Done', 'AAA').localeCompare(b.status.replace('Done', 'AAA'));
  }));

  res.render('index', { team: TEAM, sprint: SPRINT, dates: DATES, data: Object.entries(epics) });
});

module.exports = router;
