"""Extract the supplied guide without changing the workbook (Python standard library)."""
import json
import re
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

NS = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
SOURCE_URL = 'https://docs.google.com/spreadsheets/d/1NrYADsW4s7wRYTE91Z0EFHbXcHaswuuMzG9a2WyGG0A/edit?gid=1524747248#gid=1524747248'

EARLY_TITLES = {
 10: 'Buy your first Time Dimension', 14: 'Reach e426 IP and earn 3 EP',
 15: 'Enable Respec Time Studies', 16: 'Get 11 TT and unlock TS42',
 22: 'Get TS51', 23: 'Get TS61',
 24: 'Get e120,000 AM, e600 IP, 8 EP TT',
 28: 'Reach Eternity Milestone 5', 29: 'Reach EM7 and buy EU1 + EU2',
 30: 'Reach EM9 and tune your autobuyers', 31: 'Buy the 500 EP ×5 EP upgrade',
 32: 'Reach Eternity Milestone 25', 33: 'Get TS71 and reach 100 Eternities',
 34: 'Get e120,000 AM, e600 IP, 256 EP TT',
 37: 'Buy the next ×5 EP upgrade and EU3', 38: 'Get the “Never Again” achievement',
 39: 'Get e200,000 AM and e900 IP', 40: 'Get TS81, TS91, and TS101',
 41: 'Farm to 40 TT', 42: 'Get a 3–4 second Eternity', 43: 'Switch to the Infinity Dimension path',
 46: 'Improve your fastest Eternity', 47: 'Get e260,000 AM and e1,200 IP',
 48: 'Get TS111 and the 1.25e6 EP upgrade', 49: 'Get e280,000 AM and e1,400 IP',
 50: 'Get 52 TT and switch to the ID path', 51: 'Get e300,000 AM and e1,500 IP',
 52: 'Get TS122 at 54 TT', 55: 'Buy the 6.25e7 EP ×5 EP upgrade',
 56: 'Get e320,000 AM and e1,600 IP', 57: 'Buy the 5.37e8 EP Time Theorem',
 58: 'Get the Active tree at 63 TT', 59: 'Set up TS121 for a 50× bonus',
 60: 'Get e340,000 AM and e1,800 IP', 61: 'Switch to the ID path at 67 TT',
 64: 'Get TS141 and the 3.13e9 EP upgrade', 65: 'Buy TT through 1.72e10 EP',
 66: 'Get e400,000 AM and e2,100 IP', 67: 'Get TS151 at 78 TT',
 68: 'Get e440,000 AM and e2,300 IP', 69: 'Get TS161',
 70: 'Get e480,000 AM and e2,500 IP', 71: 'Buy TT through 4.40e12 EP',
 72: 'Get TS162 at 93 TT', 73: 'Get e520,000 AM and e2,700 IP',
 74: 'Get TS171 at 100 TT', 77: 'Get e560,000 AM and e2,900 IP',
 78: 'Buy the 3.9e14 EP ×5 EP upgrade', 79: 'Get e600,000 AM and e3,100 IP',
 80: 'Buy the achievement-based Eternity Upgrade', 81: 'Get e640,000 AM and e3,300 IP',
 82: 'Get TS31 and set up Eternity farming', 83: 'Farm at least 20,000 Eternities',
 84: 'Buy the 1.95e16 EP ×5 EP upgrade', 85: 'Get e700,000 AM and e3,600 IP',
 86: 'Reach 130 TT and prepare for EC1',
}

def read_sheets(path):
    with zipfile.ZipFile(path) as archive:
        strings = [''.join(n.itertext()) for n in ET.fromstring(archive.read('xl/sharedStrings.xml'))]
        result = {}
        for number in (1, 3, 4, 5):
            rows = {}
            root = ET.fromstring(archive.read(f'xl/worksheets/sheet{number}.xml'))
            for row in root.findall('m:sheetData/m:row', NS):
                values = {}
                for cell in row.findall('m:c', NS):
                    value = cell.find('m:v', NS)
                    if value is not None:
                        values[re.sub(r'\d', '', cell.attrib['r'])] = strings[int(value.text)] if cell.attrib.get('t') == 's' else value.text
                rows[int(row.attrib['r'])] = values
            result[number] = rows
        return result

def extract(path):
    sheets = read_sheets(path)
    objectives = []
    for row, title in EARLY_TITLES.items():
        description = sheets[1][row]['B'].strip()
        section = 'First Time Studies' if row < 26 else 'Eternity milestones' if row < 36 else 'Building your study tree' if row < 63 else 'The road to challenges'
        tree = re.search(r'TS (?:setup|Tree|Tree|tree)\s*:\s*([\d, ]+)', description, re.I)
        objectives.append(dict(id=f'eternity-{row}', title=title, description=description, section=section,
            kind='study' if title.startswith(('Get TS', 'Switch', 'Get the Active')) else 'milestone',
            studies=tree.group(1).replace(' ', '').rstrip(',') if tree else None,
            source=dict(sheet='Eternity Start', row=row)))

    ip_goals = {cells.get('C', '').upper(): str(int(float(cells['E']))) for cells in sheets[3].values() if 'E' in cells and re.fullmatch(r'EC\d+[xX]\d+', cells.get('C', ''))}
    for row, cells in sheets[4].items():
        if row < 3 or not cells.get('B'):
            continue
        description = cells['B'].strip()
        if row == 40:
            objectives[-1]['description'] += '\n\n' + description
            continue
        challenge = re.match(r'(EC\d+)[xX](\d+)\s*:', description)
        challenge_id = f'{challenge[1]}x{challenge[2]}' if challenge else None
        if challenge:
            title = f'Complete {challenge_id}'
        elif row == 39:
            title = 'Unlock EC8x1 with the TS133 trick'
        elif row == 82:
            title = 'Use the 1,292 TT farming tree'
        elif description.startswith('At Total'):
            title = 'Update your tree at ' + re.search(r'At Total (\d+TT)', description)[1]
        else:
            title = re.split(r',|\s+then\s+', description, maxsplit=1, flags=re.I)[0].strip()
        section = 'Early challenges' if row < 39 else 'EC8 and EC9' if row < 79 else 'EC10 and beyond' if row < 91 else 'Final challenges'
        tt = re.search(r'(?:Require|Recommended)\s*:\s*(\d+)TT', description)
        duration = re.search(r'(?:Average Time|Time)\s*:\s*([^,]+)', description)
        objectives.append(dict(id=f'planner-{row}', title=title, description=description, section=section,
            kind='challenge' if challenge else 'study' if cells.get('C') else 'milestone',
            studies=cells.get('C'), challenge=challenge_id,
            timeTheorems=int(tt[1]) if tt else None, duration=duration[1].strip() if duration else None,
            ipGoal=ip_goals.get(challenge_id.upper()) if challenge_id else None,
            source=dict(sheet='EC Planner v2.6', row=row)))
    challenge_order = [c['B'].upper() for c in sheets[5].values() if re.fullmatch(r'EC\d+[xX]\d+', c.get('B', ''))]
    actual = [o['challenge'].upper() for o in objectives if o.get('challenge')]
    assert actual == challenge_order, 'Planner and challenge-order sheets disagree'
    assert len(set(actual)) == 60, 'Expected 60 unique Eternity Challenge completions'
    assert len({o['id'] for o in objectives}) == len(objectives)
    return dict(sourceUrl=SOURCE_URL, sourceFile=Path(path).name, objectives=objectives)

if __name__ == '__main__':
    data = extract(sys.argv[1])
    Path(sys.argv[2]).parent.mkdir(parents=True, exist_ok=True)
    Path(sys.argv[2]).write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    print(f"Extracted {len(data['objectives'])} objectives, including all 60 challenge completions.")
