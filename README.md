    <link rel="stylesheet" type="text/css" href="owm-datepicker/owm.datepicker.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
    <script type="text/javascript" src="owm-datepicker/owm.datepicker.js"></script>


    var dp = new OWMDatePicker('datepicker');
    dp.onChange(function(from, to) {
      console.log('from: ', from, '\nto: ', to);
    });
    dp.loadDates(data);