Feature: Export and Import Local Storage
  As a user
  I want to export my data to a compacted string and import it back
  So that I can back up or transfer my sticker inventory, compare entries, and trade data

  Background:
    Given the user has sticker inventory, compare entries, and trade data in local storage

  Scenario: Export data by downloading a file
    When they open the export/import drawer
    And they click the "Download" button
    Then a text file is downloaded containing the compacted storage data

  Scenario: Export data by copying to clipboard
    When they open the export/import drawer
    And they click the "Copy" button
    Then the compacted storage data is copied to the clipboard

  Scenario: Import data from a file
    Given the export/import drawer is open
    When they click "Import file"
    And they select a valid export file
    Then all data in local storage is restored from the file

  Scenario: Import data by pasting text
    Given the export/import drawer is open
    When they paste compacted data into the text input
    And they confirm the import
    Then all data in local storage is restored from the pasted data

  Scenario: Import with malformed data shows error
    Given the export/import drawer is open
    When they paste invalid or corrupted data
    And they confirm the import
    Then an error message is displayed
    And their local storage data is not modified
