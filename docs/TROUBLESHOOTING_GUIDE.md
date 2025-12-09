# QPerform Troubleshooting Guide

**Version:** 1.0
**Last Updated:** December 9, 2025
**Application:** QPerform Performance Management System

---

## Table of Contents

1. [Common Issues](#common-issues)
2. [Login & Authentication Issues](#login--authentication-issues)
3. [Performance Data Issues](#performance-data-issues)
4. [Action Logging Issues](#action-logging-issues)
5. [Display & UI Issues](#display--ui-issues)
6. [Filter & Search Issues](#filter--search-issues)
7. [Permission & Access Issues](#permission--access-issues)
8. [Network & Connectivity Issues](#network--connectivity-issues)
9. [Browser-Specific Issues](#browser-specific-issues)
10. [Error Messages Reference](#error-messages-reference)
11. [Advanced Troubleshooting](#advanced-troubleshooting)
12. [When to Contact Support](#when-to-contact-support)

---

## Common Issues

### Quick Fixes That Solve 80% of Problems

Before diving into specific issues, try these quick fixes:

1. **Refresh the Page**
   - Press `F5` or `Ctrl+R` (Windows) / `Cmd+R` (Mac)
   - Hard refresh: `Ctrl+Shift+R` (Windows) / `Cmd+Shift+R` (Mac)

2. **Clear Browser Cache**
   - Chrome: `Ctrl+Shift+Delete` → Select "Cached images and files" → Clear data
   - Edge: `Ctrl+Shift+Delete` → Select "Cached data and files" → Clear
   - Firefox: `Ctrl+Shift+Delete` → Select "Cache" → Clear Now

3. **Check Internet Connection**
   - Verify you're connected to the internet
   - Try accessing another website
   - Check WiFi or ethernet connection

4. **Log Out and Back In**
   - Click your name in the top right
   - Select "Logout"
   - Log back in with Microsoft SSO

5. **Try a Different Browser**
   - If using Chrome, try Edge or Firefox
   - Helps identify browser-specific issues

---

## Login & Authentication Issues

### Issue: Cannot Access Login Page

**Symptoms:**
- Page doesn't load
- Blank white screen
- "Site can't be reached" error

**Solutions:**

1. **Check the URL**
   - Verify you're using the correct URL
   - Correct format: `https://qperform.yourcompany.com`
   - Check for typos

2. **Check Network Connection**
   - Are you on the corporate network or VPN?
   - QPerform may require VPN access if working remotely

3. **Check with IT**
   - Firewall may be blocking access
   - Domain may not be whitelisted

### Issue: Microsoft Login Fails

**Symptoms:**
- Error after entering Microsoft credentials
- "Authentication failed" message
- Redirects back to login page

**Solutions:**

1. **Verify Account Type**
   - You must use your OnQ Microsoft 365 account
   - Personal Microsoft accounts won't work
   - Format: `firstname.lastname@onqfinancial.com`

2. **Check Account Status**
   - Is your Microsoft account active?
   - Try logging into Outlook or Teams to verify
   - Contact IT if account is locked

3. **Clear Browser Cookies**
   - Old authentication cookies may interfere
   - Clear cookies for both `qperform.yourcompany.com` and `login.microsoftonline.com`

4. **Disable Browser Extensions**
   - Ad blockers or privacy extensions may interfere
   - Try logging in with browser in incognito/private mode

### Issue: "Access Denied" After Login

**Symptoms:**
- Login succeeds but shows "Access Denied" page
- Message: "You do not have permission to access QPerform"

**Solutions:**

1. **Verify Access Granted**
   - Your account must be granted access by IT/HR
   - Contact your manager to request access

2. **Check Role Assignment**
   - Your role must be configured in the system
   - Contact IT to verify role assignment

3. **Wait for Sync**
   - If you were just granted access, wait 10-15 minutes
   - System may need time to sync permissions
   - Log out and back in

### Issue: Session Expires Too Quickly

**Symptoms:**
- Logged out after short period of inactivity
- "Session expired" message
- Must re-login frequently

**Solutions:**

1. **This is Normal Behavior**
   - Access tokens expire after 1 hour of inactivity
   - Security feature to protect data

2. **Automatic Refresh**
   - System should auto-refresh tokens if page is active
   - If not working, clear cache and cookies

3. **Keep Tab Active**
   - If inactive for extended period, session will expire
   - Refresh the page before it expires

### Issue: Stuck on OAuth Callback Page

**Symptoms:**
- URL shows `/auth/callback` but page is blank
- Spinning loader that never completes
- No error message

**Solutions:**

1. **Wait 30 Seconds**
   - Callback processing may take a moment
   - Don't refresh immediately

2. **Check URL for Error**
   - Look for `?error=` in the URL
   - Note the error message and contact support

3. **Clear Callback State**
   - Manually navigate to home page: `https://qperform.yourcompany.com`
   - Try login process again

4. **Check Browser Console**
   - Press `F12` to open developer tools
   - Look for red error messages in Console tab
   - Take screenshot and send to support

---

## Performance Data Issues

### Issue: Performance Grid is Empty

**Symptoms:**
- Grid shows no agents
- "No data available" message
- Blank white grid area

**Solutions:**

1. **Check Filters**
   - Are month/year filters set correctly?
   - Try selecting current month and year
   - Click "Reset Filters" button

2. **Check Access Level**
   - Do you have permission to view this data?
   - Supervisors can only see their direct reports
   - Managers can only see assigned clients

3. **Verify Data Exists**
   - Is there actually data for the selected period?
   - Try a different month that you know has data

4. **Check Metric Toggle**
   - Are you on the correct metric (QA vs Production)?
   - Try toggling to the other metric

### Issue: Performance Scores Look Wrong

**Symptoms:**
- Scores don't match expected values
- All scores showing 0% or 100%
- Colors don't match scores

**Solutions:**

1. **Verify Metric Type**
   - Make sure you're viewing the correct metric (QA vs Production)
   - QA and Production have different scores

2. **Check Week Range**
   - Verify you're looking at the correct week
   - Week ranges are Sunday-Saturday

3. **Confirm Data Source**
   - Performance data comes from backend system
   - Contact backend team if data is incorrect at source

4. **Check for Calculation Errors**
   - Refresh the page to recalculate
   - Clear cache and reload

### Issue: At-Risk Badges Not Showing

**Symptoms:**
- Agent should be at-risk but no badge appears
- Badge shows wrong risk level
- Badge appears but shouldn't

**Solutions:**

1. **Verify Criteria**
   - 3+ consecutive underperforming weeks, OR
   - 3+ total underperforming weeks in month, OR
   - 1+ Written Warnings active
   - Check if agent actually meets criteria

2. **Check Warning Category**
   - At-risk is calculated separately for Production vs QA
   - Toggle to the correct metric

3. **Verify Action Log Loaded**
   - At-risk detection requires action log data
   - Refresh the page to reload action logs

4. **Check Warning Expiration**
   - Expired warnings don't count
   - Verify warning hasn't expired

### Issue: Performance Data Not Updating

**Symptoms:**
- Same data showing as last week
- New week doesn't appear
- Week columns not advancing

**Solutions:**

1. **Check Update Schedule**
   - Data updates weekly, typically Monday mornings
   - Current week may not be available until it completes

2. **Hard Refresh**
   - Press `Ctrl+Shift+R` to bypass cache
   - This forces fresh data from server

3. **Verify Backend Updates**
   - Contact backend team to confirm data pipeline is running
   - Issue may be upstream in data processing

### Issue: Missing Agents in Grid

**Symptoms:**
- Some agents don't appear
- Agent count doesn't match expected
- Specific agent cannot be found

**Solutions:**

1. **Check Filters**
   - Client, category, or task filters may exclude agent
   - Clear all filters and search again

2. **Check Agent Status**
   - Agent may have left the company
   - Agent may have transferred to different client/team
   - Verify agent is still active in system

3. **Check Access Permissions**
   - You may not have access to that agent's client
   - Contact manager to verify access

4. **Search by Email**
   - Use filter to search for specific agent email
   - Agent name may have changed but email hasn't

---

## Action Logging Issues

### Issue: Cannot Submit Action

**Symptoms:**
- Submit button is disabled
- Form shows validation errors
- Action doesn't save after clicking Submit

**Solutions:**

1. **Check Required Fields**
   - All fields marked with * are required
   - Employee, Date, Action Type, Week Range, Notes, Taken By
   - Fill in all required fields

2. **Check Notes Length**
   - Notes must be at least 10 characters
   - Be more descriptive

3. **Check Warning Progression**
   - You cannot skip warning levels
   - Error message will tell you the issue
   - Example: Can't issue Written Warning if no Verbal Warnings exist

4. **Check Network Connection**
   - Action may be failing to send to server
   - Check browser console for errors
   - Verify internet connection

### Issue: Warning Progression Validation Error

**Symptoms:**
- Error: "Cannot skip warning levels"
- Error: "First warning must be a Verbal Warning"
- Cannot issue desired warning type

**Solutions:**

1. **Understand Progression Rules**
   ```
   First offense     → Verbal Warning (required)
   Second offense    → Verbal Warning #2
   Third offense     → Written Warning
   After 2 Written   → Final Warning / PIP / Termination
   ```

2. **Check Current Warning Status**
   - Look at "Current Warning Status" section in dialog
   - See what warnings agent currently has active

3. **Issue Correct Warning Type**
   - Follow the progression shown in recommendation
   - Cannot jump from 1 Verbal to Written
   - Must issue 2nd Verbal first

### Issue: Expiration Date is Wrong

**Symptoms:**
- Expiration date doesn't match expected
- Date is in the past
- Date is too far in the future

**Solutions:**

1. **Expiration is Auto-Calculated**
   - You cannot manually edit expiration dates
   - They are calculated based on warning type:
     - Verbal: 90 days
     - Written: 180 days
     - Final: 365 days
     - PIP: 90 days
     - Termination: No expiration

2. **Check Action Date**
   - Expiration is calculated from Action Date
   - If Action Date is wrong, expiration will be wrong
   - Correct the Action Date

3. **Verify System Date**
   - Check your computer's system date is correct
   - Incorrect system date can cause calculation errors

### Issue: Duplicate Action Error

**Symptoms:**
- Error: "Action already exists for this week"
- Cannot submit action
- Message about duplicate

**Solutions:**

1. **Check Action Log**
   - Go to Action Log tab
   - Search for the agent
   - Verify if action already exists for that week

2. **Edit Existing Action**
   - Instead of creating new action, update the existing one
   - Or delete the old one if it was entered in error

3. **Use Different Week**
   - If action is for a different week, select correct week range
   - System only allows one action per agent per week

### Issue: Action Doesn't Appear in Action Log

**Symptoms:**
- Action submitted successfully
- Confirmation message shown
- But action not in Action Log

**Solutions:**

1. **Refresh Action Log**
   - Click Action Log tab again
   - Press F5 to refresh page

2. **Check Filters**
   - Action Log may be filtered
   - Clear all filters to show all actions

3. **Wait for Sync**
   - Give it 30 seconds to sync
   - Refresh again

4. **Verify Submission**
   - Did you actually see success message?
   - If error occurred, action wasn't saved
   - Try submitting again

---

## Display & UI Issues

### Issue: Layout Looks Broken

**Symptoms:**
- Elements overlapping
- Text cut off
- Buttons in wrong places
- Grid columns misaligned

**Solutions:**

1. **Clear Browser Cache**
   - Old CSS may be cached
   - Hard refresh: `Ctrl+Shift+R`

2. **Check Zoom Level**
   - Browser zoom should be 100%
   - Press `Ctrl+0` to reset zoom
   - QPerform is optimized for 100% zoom

3. **Check Screen Resolution**
   - Minimum recommended: 1366x768
   - Best experience: 1920x1080 or higher

4. **Try Different Browser**
   - Chrome or Edge recommended
   - Update browser to latest version

### Issue: Performance Badges Show Wrong Colors

**Symptoms:**
- Score is 96% but showing yellow instead of red
- Colors don't match the score
- All badges are same color

**Solutions:**

1. **Check Metric Type**
   - QA and Production have different color thresholds
   - Verify you're on the correct metric toggle

2. **Verify Thresholds**
   ```
   QA:
   - Red: < 97%
   - Orange: 97-98%
   - Yellow: 98-99%
   - Light Green: 99-100%
   - Green: ≥ 100%

   Production:
   - Red: < 98%
   - Orange: 98-99%
   - Yellow: 99-100%
   - Light Green: 100-101%
   - Green: > 101%
   ```

3. **Check Flag vs KPI**
   - Badge color is based on KPI score, not flag
   - Flag is informational only

4. **Clear Cache**
   - Cached color logic may be outdated
   - Hard refresh

### Issue: Dialogs Won't Open

**Symptoms:**
- Click "Take Action" but nothing happens
- Click "View Actions" but dialog doesn't appear
- No error message shown

**Solutions:**

1. **Check for Pop-up Blocker**
   - Browser may be blocking modal dialogs
   - Disable pop-up blocker for QPerform domain
   - Add site to allowed list

2. **Check Browser Console**
   - Press F12
   - Look for JavaScript errors in Console tab
   - Take screenshot and report to support

3. **Disable Browser Extensions**
   - Extensions may interfere with dialogs
   - Try in incognito/private mode
   - Disable extensions one by one to find culprit

4. **Try Different Browser**
   - Issue may be browser-specific
   - Chrome or Edge recommended

### Issue: Text is Too Small/Large

**Symptoms:**
- Can't read text
- Text is blurry
- Font size inconsistent

**Solutions:**

1. **Check Browser Zoom**
   - Press `Ctrl+0` to reset to 100%
   - QPerform is designed for 100% zoom

2. **Check Operating System DPI Settings**
   - Windows: Display Settings → Scale should be 100%
   - High DPI may cause rendering issues

3. **Use Browser Zoom if Needed**
   - `Ctrl++` to zoom in
   - `Ctrl+-` to zoom out
   - Some layout issues may occur at non-100% zoom

### Issue: Grid is Slow or Laggy

**Symptoms:**
- Scrolling is choppy
- Clicking cells has delay
- Grid takes long time to render

**Solutions:**

1. **Close Unnecessary Browser Tabs**
   - Too many tabs consume memory
   - Close tabs you're not using

2. **Use Filters to Reduce Data**
   - Don't try to view all agents at once
   - Filter by client or category
   - View one month at a time

3. **Check Computer Performance**
   - Open Task Manager (Ctrl+Shift+Esc)
   - Check if CPU or memory is maxed out
   - Close other applications

4. **Use a Faster Browser**
   - Chrome and Edge generally faster than Firefox
   - Keep browser updated

---

## Filter & Search Issues

### Issue: Filters Not Working

**Symptoms:**
- Select filter but data doesn't change
- "Apply" button doesn't do anything
- Filters reset after refresh

**Solutions:**

1. **Click "Apply" Button**
   - Filters don't auto-apply
   - You must click "Apply" after selecting

2. **Check Filter Combinations**
   - Some combinations may have no data
   - Example: Client A + Category X may not exist
   - Try broader filters

3. **Reset Filters**
   - Click "Reset Filters"
   - Start fresh with new filter selection

4. **Refresh Page**
   - Filters may be stuck
   - Hard refresh: Ctrl+Shift+R

### Issue: Can't Select Certain Filter Options

**Symptoms:**
- Dropdown options are grayed out
- Some months/clients not available
- Filter list is empty

**Solutions:**

1. **Check Cascading Filters**
   - Filters cascade based on available data
   - If you select Client A, only categories for Client A will show
   - Clear other filters to see more options

2. **Check Access Permissions**
   - You may not have access to certain clients
   - Only your accessible clients will appear

3. **Verify Data Exists**
   - No data for that filter combination
   - Backend may not have data for that period

### Issue: Search Not Finding Agent

**Symptoms:**
- Type agent name in search but no results
- Agent should exist but doesn't appear
- Search returns 0 results

**Solutions:**

1. **Check Spelling**
   - Verify agent name is spelled correctly
   - Try first name, last name, or email

2. **Use Email Search**
   - Search by email is more reliable
   - Format: `firstname.lastname@domain.com`

3. **Check Filters**
   - Active filters may exclude the agent
   - Reset all filters and try again

4. **Verify Agent Exists in Current Period**
   - Agent may not have data for selected month
   - Agent may have started/left during that period

---

## Permission & Access Issues

### Issue: Can't See Certain Clients

**Symptoms:**
- Client filter doesn't show expected clients
- Other users can see clients you can't
- "No data" for a client you should access

**Solutions:**

1. **Check Your Role**
   - Supervisors and Team Leads: Only direct reports
   - Managers: Only assigned clients
   - Directors and AVPs: All clients
   - Contact manager to verify role

2. **Request Access**
   - If you need access to additional clients
   - Contact your manager or IT
   - Provide business justification

3. **Verify Role Assignment**
   - Your role may not be correctly configured
   - Contact IT to check role in system

### Issue: Can't Take Actions

**Symptoms:**
- "Take Action" button is missing
- Button is disabled/grayed out
- Error when trying to submit action

**Solutions:**

1. **Check Permission Level**
   - Only certain roles can take actions:
     - Team Leads: Yes
     - Supervisors: Yes
     - Managers: Yes
     - Directors: Yes
     - AVPs: Yes
     - Agents: No

2. **Verify Account Setup**
   - Contact IT to verify your permissions
   - May need role updated in system

3. **Check if Agent is in Your Scope**
   - You can only take actions on agents you have access to
   - Can't take actions on agents from clients you don't manage

### Issue: Can't Delete Actions

**Symptoms:**
- Delete button missing
- Delete button disabled
- Error when trying to delete

**Solutions:**

1. **Check Permissions**
   - You can only delete actions you created
   - Or actions for agents in your scope
   - Directors/AVPs can delete more broadly

2. **Check Action Status**
   - Some actions may be locked
   - System actions can't be deleted

3. **Contact Support**
   - If you need to delete someone else's action
   - Provide business justification
   - May require director approval

---

## Network & Connectivity Issues

### Issue: Page Loads Very Slowly

**Symptoms:**
- Page takes minutes to load
- Spinner keeps spinning
- Parts of page don't load

**Solutions:**

1. **Check Internet Speed**
   - Run speed test: speedtest.net
   - Minimum recommended: 10 Mbps download
   - If slow, contact your ISP or IT

2. **Check VPN Connection**
   - If using VPN, try disconnecting and reconnecting
   - VPN may be slow or unstable
   - Try different VPN server

3. **Check Network Congestion**
   - Many users on same network?
   - Peak hours may be slower
   - Try accessing during off-peak hours

4. **Disable Browser Extensions**
   - Extensions can slow down page load
   - Try incognito/private mode

### Issue: "Network Error" Message

**Symptoms:**
- Error: "Network Error"
- Error: "Failed to fetch"
- Error: "ERR_CONNECTION_REFUSED"

**Solutions:**

1. **Check Internet Connection**
   - Are you connected to internet?
   - Try accessing another website
   - Restart router/modem if needed

2. **Check Firewall**
   - Corporate firewall may block connection
   - Contact IT to whitelist QPerform domain
   - May need firewall exception

3. **Check VPN**
   - Are you required to use VPN?
   - Connect to VPN and try again
   - Or disconnect VPN if not required

4. **Check Backend Status**
   - Backend API may be down
   - Contact IT to verify backend is running
   - Check status page if available

### Issue: API Timeout Errors

**Symptoms:**
- Error: "Request timeout"
- Error: "504 Gateway Timeout"
- Operations fail after long wait

**Solutions:**

1. **Wait and Retry**
   - Server may be experiencing high load
   - Wait 1-2 minutes and try again

2. **Reduce Data Load**
   - Use filters to request less data
   - View one month at a time
   - Don't request all clients/agents at once

3. **Check with IT**
   - Backend may need performance tuning
   - Database queries may be slow
   - Report specific operation that times out

### Issue: Changes Not Saving

**Symptoms:**
- Submit action but it doesn't save
- Data reverts after refresh
- "Save failed" error

**Solutions:**

1. **Check Network Connection**
   - Connection may have dropped during save
   - Verify you're still connected
   - Try save operation again

2. **Check for Errors**
   - Look for error message
   - Check browser console (F12)
   - Note exact error message

3. **Verify Data Format**
   - Invalid data may cause save failure
   - Check all required fields are filled
   - Check date formats are correct

4. **Try Again**
   - Temporary network glitch
   - Wait 30 seconds and retry
   - If persists, contact support

---

## Browser-Specific Issues

### Chrome Issues

**Issue: Cookie errors**
- Solution: Settings → Privacy → Clear browsing data → Cookies
- Ensure "Allow cookies" is enabled for QPerform domain

**Issue: Auto-fill interfering**
- Solution: Disable auto-fill for QPerform
- Settings → Autofill → Disable for specific fields

**Issue: Extensions blocking features**
- Solution: Disable extensions or use Incognito mode
- Common culprits: Ad blockers, privacy extensions

### Edge Issues

**Issue: Compatibility mode**
- Solution: Ensure site is not in compatibility mode
- Edge → Settings → Default browser → Remove from compatibility list

**Issue: Tracking prevention**
- Solution: Reduce tracking prevention level
- Edge → Settings → Privacy → Tracking prevention → Balanced

### Firefox Issues

**Issue: Enhanced tracking protection**
- Solution: Disable for QPerform domain
- Shield icon in address bar → Turn off protection for this site

**Issue: Cookie policies**
- Solution: Allow third-party cookies for authentication
- Settings → Privacy → Custom → Allow cookies

### Safari Issues

**Issue: Intelligent tracking prevention**
- Solution: Disable for QPerform
- Safari → Preferences → Privacy → Uncheck "Prevent cross-site tracking"

**Issue: Cookie blocking**
- Solution: Allow cookies from QPerform and Microsoft
- Safari → Preferences → Privacy → Allow from websites I visit

---

## Error Messages Reference

### Authentication Errors

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "Authentication failed" | Invalid Microsoft credentials | Verify email and password are correct |
| "Access token expired" | Session timeout | Log out and log back in |
| "Unauthorized" | No access granted | Contact IT to request access |
| "Invalid redirect" | OAuth configuration error | Contact support |
| "CORS error" | Cross-origin policy issue | Contact IT - backend configuration needed |

### Data Loading Errors

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "Failed to load performance data" | API error or no data | Check filters, verify backend is running |
| "No data available" | No records for selected filters | Try different month/client/category |
| "Failed to load filters" | Backend API down | Contact IT |
| "Network error" | Internet connection issue | Check network connection |

### Action Logging Errors

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "Cannot skip warning levels" | Invalid warning progression | Issue correct warning type per progression |
| "First warning must be Verbal" | Trying to issue Written first | Issue Verbal Warning first |
| "Required field missing" | Form validation error | Fill in all required fields |
| "Notes must be at least 10 characters" | Notes too short | Write more detailed notes |
| "Duplicate action exists" | Action already logged for this week | Check Action Log, use different week |
| "Failed to create action" | Server error | Retry, contact support if persists |

### Permission Errors

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "Access denied" | No permission for this operation | Verify your role with IT |
| "Insufficient permissions" | Role doesn't allow this action | Contact manager |
| "Not authorized to view this data" | Client access not granted | Request access from manager |

---

## Advanced Troubleshooting

### Checking Browser Console for Errors

1. Open Developer Tools
   - Press `F12` or right-click → "Inspect"

2. Click "Console" tab

3. Look for red error messages

4. Common error types:
   - **401 Unauthorized:** Authentication issue
   - **403 Forbidden:** Permission issue
   - **404 Not Found:** Backend endpoint missing
   - **500 Internal Server Error:** Backend crash
   - **CORS error:** Cross-origin policy issue

5. Take screenshot of errors and send to support

### Checking Network Tab

1. Open Developer Tools (F12)

2. Click "Network" tab

3. Refresh the page

4. Look for failed requests (red text)

5. Click failed request to see details:
   - Request URL
   - Status code
   - Response message

6. Send details to support

### Checking Local Storage

1. Open Developer Tools (F12)

2. Click "Application" tab (Chrome) or "Storage" tab (Firefox)

3. Expand "Local Storage"

4. Click your QPerform domain

5. Check for:
   - `qsoftware_token` - Should exist if logged in
   - `qsoftware_user` - Should contain your user info
   - `qsoftware_refresh_token` - Should exist

6. If missing, log out and back in

### Clearing Site Data Completely

**Chrome:**
1. F12 → Application → Clear storage
2. Check all boxes
3. Click "Clear site data"
4. Refresh page

**Firefox:**
1. F12 → Storage → Right-click domain
2. "Delete All"
3. Refresh page

**Edge:**
1. Same as Chrome

### Testing in Incognito/Private Mode

1. Open incognito window
   - Chrome/Edge: `Ctrl+Shift+N`
   - Firefox: `Ctrl+Shift+P`

2. Navigate to QPerform

3. Log in

4. Test the issue

5. If works in incognito:
   - Problem is browser cache, cookies, or extension
   - Clear cache/cookies in normal mode
   - Disable extensions

---

## When to Contact Support

### Contact IT Support For:

- Cannot log in after multiple attempts
- "Access Denied" even though you should have access
- Page won't load at all
- Backend errors (500, 502, 503, 504)
- Need access to additional clients
- Need role changed
- Suspected system outage

### Contact Your Manager For:

- Questions about warning policies
- When to escalate actions
- Clarification on recommendations
- Access to specific clients/teams
- Policy exceptions

### Contact HR For:

- Questions about progressive discipline
- Termination procedures
- Legal compliance questions
- Employee relations issues

### Contact Development Team For:

- Bug reports
- Feature requests
- Data calculation errors
- Recommendation engine issues
- Performance optimization

### Information to Provide When Reporting Issues

Include all of the following:

1. **Your Information**
   - Name
   - Email
   - Role in organization

2. **Issue Description**
   - What you were trying to do
   - What you expected to happen
   - What actually happened

3. **Steps to Reproduce**
   - Exact steps to recreate the issue
   - Be specific (e.g., "Clicked Take Action on Jane Doe for Week 12/15-12/21")

4. **Error Messages**
   - Exact error message text
   - Screenshot if possible

5. **Environment**
   - Browser and version
   - Operating system
   - Network (VPN, corporate network, home)

6. **When Did It Start?**
   - First time or recurring?
   - Did it work before?
   - What changed?

---

## Support Contact Information

### IT Help Desk
- **Email:** support@qsoftware.cloud
- **Phone:** (555) 123-4567
- **Hours:** Monday-Friday, 8AM-5PM PST
- **Emergency:** (555) 123-4568 (24/7)

### QPerform Support
- **Email:** qperform-support@qsoftware.cloud
- **Slack:** #qperform-support
- **Documentation:** https://docs.qperform.com

### System Status
- **Status Page:** https://status.qsoftware.cloud
- Check for known outages or maintenance

---

## Quick Troubleshooting Checklist

Before contacting support, try these steps:

- [ ] Refresh the page (F5)
- [ ] Hard refresh (Ctrl+Shift+R)
- [ ] Clear browser cache and cookies
- [ ] Log out and back in
- [ ] Try a different browser
- [ ] Check internet connection
- [ ] Verify you're on VPN (if required)
- [ ] Check browser console for errors (F12)
- [ ] Try in incognito/private mode
- [ ] Disable browser extensions
- [ ] Restart browser
- [ ] Restart computer

If none of these work, contact support with detailed information about the issue.

---

**Document Version:** 1.0
**Last Reviewed:** December 9, 2025
**Next Review:** March 9, 2026
