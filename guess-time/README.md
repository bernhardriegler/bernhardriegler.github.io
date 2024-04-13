A simple game where the user tries to guess how many seconds have passed since they last clicked the button. The margin of error is displayed each time the button is clicked.

Generated with Github Copilot with the following prompt:
```
Write a web app. 

A button is displayed. 

When the button is clicked: 
    - A random time interval between 1 and 100 seconds is generated. 
    - The button text changes to the text: "I guess X seconds have passed" - where X is the value of the generated interval in seconds.

When to user clicks on the button again, compare the current time to the previously generated time interval.

Add a paragraph saying: 

"Margin of error Z" - where Z is the difference between the duration of the actual elapsed time between now and the last time the button was clicked and now and the generated time interval
```