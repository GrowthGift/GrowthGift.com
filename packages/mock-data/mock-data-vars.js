ggMockData ={};

ggMockData._dtFormat =msTimezone.dateTimeFormat;
ggMockData._nowTimeFormat ='2015-09-01 12:00:00+00:00';
ggMockData._nowTime =moment(ggMockData._nowTimeFormat, ggMockData._dtFormat).utc();