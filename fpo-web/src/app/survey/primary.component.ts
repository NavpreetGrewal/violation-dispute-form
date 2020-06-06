import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { GeneralDataService } from "../general-data.service";
import { MatomoTracker } from "@ambroise-rabier/ngx-matomo";

declare var window: any;

@Component({
  selector: "app-survey-primary",
  templateUrl: "./primary.component.html",
  styleUrls: ["./primary.component.scss"]
})
export class SurveyPrimaryComponent implements OnInit {
  public cacheName: string;
  public printUrl: string;
  public resultJson: any;
  public surveyPath: string;
  public surveyJson: any;
  public complete: Function;
  public data: any;
  public jsonObject: any;
  protected initialMode = "";

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: GeneralDataService,
    private matomoTracker: MatomoTracker
  ) {}

  ngOnInit() {
    const routeData = this.route.snapshot.data;
    this.surveyPath = routeData.survey_path;
    this.surveyJson = routeData.survey;
    this.cacheName = routeData.cache_name;
    this.complete = data => this.onComplete(data);
    const hash = this.route.snapshot.fragment;
    if (hash === "print") this.initialMode = "print";
  }

  onComplete(data) {
    const path = this.route.snapshot.url[0].path;
    if (path === "qualify") {
      console.log(data);
      const ok =
        data.PORConfirmed && data.PORConfirmed[0] === "confirmed"
          ? "qualified"
          : "unqualified";
      this.router.navigate(["result", "_", ok]);
    } else if (this.cacheName) {
      if (data) {
        this.showPrintable(data);
      } else {
        this.printUrl = null;
        this.initialMode = "";
      }
    }
  }

  showPrintable(data) {
    const formatName = function(nm) {
      if (!nm) return "";
      return (
        ((nm.first || "") + " " + (nm.middle || "")).trim() +
        " " +
        (nm.last || "")
      ).trim();
    };
    const formatDate = function(date) {
      if (!date) return "";
      const monthArray = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
      ];
      const dateVal = new Date(date + " 12:00:00Z");
      const dd = dateVal.getDate();
      const month = dateVal.getMonth();
      const yyyy = dateVal.getFullYear();
      return monthArray[month] + "/" + dd + "/" + yyyy;
    };
    const joinResults = function(results, joiner) {
      if (!joiner) joiner = " and ";
      if (!results || !results.length) return "";
      if (results.length === 1) return results[0];
      const start =
        results.length > 2
          ? results.slice(0, results.length - 1).join(", ") + ","
          : results[0];
      return start + joiner + results[results.length - 1];
    };
    const addDictEntry = function(dict, key, value) {
      if (!(key in dict)) dict[key] = [];
      dict[key].push(value);
    };
    const flattenDict = function(dict) {
      const result = [];
      for (const key of Object.keys(dict)) {
        const uniq = [];
        for (const val of dict[key]) {
          if (!~uniq.indexOf(val)) uniq.push(val);
        }
        result.push({
          key: key,
          value: joinResults(uniq, " and ")
        });
      }
      return result;
    };
    const timesTranslate = {
      "3pw": "more than twice a week",
      "2pw": "at least twice a week",
      "1pw": "at least once a week",
      "2pm": "at least every other week",
      "1pm": "at least once a month",
      "1py": "at least once a year"
    };
    const flattenTimesDict = function(timesDict) {
      const result = [];
      for (const key of Object.keys(timesDict)) {
        result.push({
          time: timesTranslate[key] || key,
          names: joinResults(timesDict[key], " and ")
        });
      }
      result.sort(function(a, b) {
        return a.time.localeCompare(b.time);
      });
      return result;
    };
    const socialTranslate = {
      phone: "phone",
      text: "text message",
      email: "email",
      social: "social media"
    };

    // add additional data starts here
    data.anyExistingOrders = data.ExistingOrders === "y" ? "y" : "n";

    data.listOfChildrenArray = [];
    data.listOfChildrenWithPOArray = [];
    data.listOfChildrenWithoutPOArray = [];
    data.listOfChildrenString = "";
    data.listOfChildrenWithPOString = "";
    data.listOfPeopleWithPOArray = [];
    data.listOfPeopleWithPOString = "";
    data.contactTypeString = "";
    data.listOfChildrenWithoutPOString = "";

    data.listOfBothGuardianArray = [];
    data.listOfBothGuardianString = "";
    data.listOfApplicantGuardianArray = [];
    data.listOfApplicantGuardianString = "";
    data.listOfRespondentGuardianArray = [];
    data.listOfRespondentGuardianString = "";

    data.listOfApplicantResponsibleArray = [];
    data.listOfApplicantResponsibleString = "";
    data.listOfRespondentResponsibleArray = [];
    data.listOfRespondentResponsibleString = "";
    data.listOfBothResponsibleArray = [];
    data.listOfBothResponsibleString = "";
    data.listOfNoResponsibleArray = [];
    data.listOfNoResponsibleString = "";
    data.listOfAdultChildrenArray = [];
    data.listOfAdultChildrenString = "";

    data.listOfEqualPtimeArray = [];
    data.listOfEqualPtimeString = "";
    data.listOfApplicantMainGuardianArray = [];
    data.listOfApplicantMainGuardianString = "";
    data.listOfApplicantAltGuardianTimes = [];
    data.listOfApplicantContactOrderArray = [];
    data.listOfApplicantContactOrderString = "";
    data.listOfRespondentMainGuardianArray = [];
    data.listOfRespondentMainGuardianString = "";
    data.listOfRespondentAltGuardianTimes = [];
    data.listOfRespondentContactOrderArray = [];
    data.listOfRespondentContactOrderString = "";
    data.listOfRespondentArrangeChildrenArray = [];
    data.listOfRespondentArrangeChildrenString = "";
    data.listOfRespondentArrangeMethodsString = "";

    const respondentApplicantArrangeMethods = {};
    const respondentApplicantArrangeMethodsArray = [];
    const applicantAltGuardianTimes = {};
    const respondentAltGuardianTimes = {};

    data.listOfChildrenTimeNoneArray = [];
    data.listOfChildrenTimeNoneString = "";

    data.PORAffidavit = "";
    data.PORAffidavitArray = [];

    data.childError = [];
    data.RespondentNoGoPlacesString = "";

    data.applicantFullName = formatName(data.ApplicantName);
    data.ApplicantDOBDateCompStr = formatDate(data.ApplicantDOB);
    data.RespondentDOBDateCompStr = formatDate(data.RespondentDOB);
    data.PorNewDateCompStr = formatDate(data.RespondentPORNewTime);

    if (data.ListOfChildren !== undefined) {
      for (const child of data.ListOfChildren) {
        child.ChildDOB = formatDate(child.ChildDOB);
        // console.log("child.childDOB is" + child.ChildDOB);

        const childFullName = formatName(child["ChildName"]);

        data.listOfChildrenArray.push(childFullName);
        if (child["ChildNeedsProtection"] === "y") {
          data.listOfChildrenWithPOArray.push(childFullName);
        } else {
          data.listOfChildrenWithoutPOArray.push(childFullName);
          if (child["RespondentApplicantArrangeChildren"] === "y") {
            data.listOfRespondentArrangeChildrenArray.push(childFullName);
            for (let entry of child["RespondentApplicantArrangeMethods"]) {
              if (entry === "other") {
                if (child["RespondentApplicantArrangeMethodsComment"]) {
                  entry = child[
                    "RespondentApplicantArrangeMethodsComment"
                  ].trim();
                  const m = entry.match(/^by\s+(.+)$/i);
                  if (m) {
                    // strip off extra by
                    entry = m[1];
                  }
                } else {
                  continue;
                }
              } else {
                entry = socialTranslate[entry] || entry;
              }
              entry = "by " + entry;
              addDictEntry(
                respondentApplicantArrangeMethods,
                childFullName,
                entry
              );
              if (!~respondentApplicantArrangeMethodsArray.indexOf(entry)) {
                respondentApplicantArrangeMethodsArray.push(entry);
              }
            }
          }
        }

        if (child["ChildIsMinor"] === "y") {
          let sharedGuardian = false;

          if (
            child["ChildApplicantGuardian"] === "y" &&
            child["ChildRespondentGuardian"] === "y"
          ) {
            data.listOfBothGuardianArray.push(childFullName);
            sharedGuardian = true;
          } else if (
            child["ChildApplicantGuardian"] === "y" &&
            child["ChildRespondentGuardian"] === "n"
          ) {
            data.listOfApplicantGuardianArray.push(childFullName);
          } else if (
            child["ChildApplicantGuardian"] === "n" &&
            child["ChildRespondentGuardian"] === "y"
          ) {
            data.listOfRespondentGuardianArray.push(childFullName);
          } else {
            data.childError.push("mChildNoGuardian");
          }

          if (sharedGuardian) {
            if (
              child["ChildApplicantPDecisions"] === "y" &&
              child["ChildRespondentPDecisions"] === "y"
            ) {
              data.listOfBothResponsibleArray.push(childFullName);
            } else if (
              child["ChildApplicantPDecisions"] === "y" &&
              child["ChildRespondentPDecisions"] === "n"
            ) {
              data.listOfApplicantResponsibleArray.push(childFullName);
            } else if (
              child["ChildApplicantPDecisions"] === "n" &&
              child["ChildRespondentPDecisions"] === "y"
            ) {
              data.listOfRespondentResponsibleArray.push(childFullName);
            } else {
              data.listOfNoResponsibleArray.push(childFullName);
            }
          }

          if (child["ChildEqualPTime"] === "y") {
            data.listOfEqualPtimeArray.push(childFullName);
          } else if (
            child["ChildEqualPTime"] === "n" &&
            child["ChildMainGuardians"] === "applicantmoreptime"
          ) {
            data.listOfApplicantMainGuardianArray.push(childFullName);
            if (child["ChildApplicantUnequalPTime"]) {
              addDictEntry(
                respondentAltGuardianTimes,
                child["ChildApplicantUnequalPTime"],
                childFullName
              );
            }
          } else if (
            child["ChildEqualPTime"] === "n" &&
            child["ChildMainGuardians"] === "respondentmoreptime"
          ) {
            data.listOfRespondentMainGuardianArray.push(childFullName);
            if (child["ChildRespondentUnequalPTime"]) {
              addDictEntry(
                applicantAltGuardianTimes,
                child["ChildRespondentUnequalPTime"],
                childFullName
              );
            }
          }

          if (
            child["ChildApplicantPTime"] === "n" &&
            child["ChildRespondentPTime"] === "n"
          ) {
            data.listOfChildrenTimeNoneArray.push(childFullName);
          }

          if (child["ChildApplicantContactOrder"] === "y") {
            data.listOfApplicantContactOrderArray.push(childFullName);
            data.anyExistingOrders = "y";
          }
          if (child["ChildRespondentContactOrder"] === "y") {
            data.listOfRespondentContactOrderArray.push(childFullName);
            data.anyExistingOrders = "y";
          }
        } else if (
          child["ChildIsMinor"] === "n" &&
          child["ChildNeedsProtection"] === "y"
        ) {
          // data.childError.push("mChildNoMainGuardian");
          data.listOfAdultChildrenArray.push(childFullName);
        }
      }
    }

    data.listOfBothGuardianString = joinResults(
      data.listOfBothGuardianArray,
      " and "
    );
    data.listOfApplicantGuardianString = joinResults(
      data.listOfApplicantGuardianArray,
      " and "
    );
    data.listOfRespondentGuardianString = joinResults(
      data.listOfRespondentGuardianArray,
      " and "
    );
    data.listOfBothResponsibleString = joinResults(
      data.listOfBothResponsibleArray,
      " and "
    );
    data.listOfApplicantResponsibleString = joinResults(
      data.listOfApplicantResponsibleArray,
      " and "
    );
    data.listOfApplicantContactOrderString = joinResults(
      data.listOfApplicantContactOrderArray,
      " and "
    );
    data.listOfRespondentResponsibleString = joinResults(
      data.listOfRespondentResponsibleArray,
      " and "
    );
    data.listOfNoResponsibleString = joinResults(
      data.listOfNoResponsibleArray,
      " and "
    );
    data.listOfAdultChildrenString = joinResults(
      data.listOfAdultChildrenArray,
      " and "
    );
    data.listOfApplicantAltGuardianTimes = flattenTimesDict(
      applicantAltGuardianTimes
    );
    data.listOfRespondentAltGuardianTimes = flattenTimesDict(
      respondentAltGuardianTimes
    );
    data.listOfRespondentContactOrderString = joinResults(
      data.listOfRespondentContactOrderArray,
      " and "
    );
    data.listOfRespondentArrangeChildrenString = joinResults(
      data.listOfRespondentArrangeChildrenArray,
      " and "
    );
    data.listOfRespondentApplicantArrange = flattenDict(
      respondentApplicantArrangeMethods
    );
    data.listOfRespondentArrangeMethodsString = joinResults(
      respondentApplicantArrangeMethodsArray,
      " and "
    );

    // Child parenting time list
    data.listOfEqualPtimeString = joinResults(
      data.listOfEqualPtimeArray,
      " and "
    );
    data.listOfApplicantMainGuardianString = joinResults(
      data.listOfApplicantMainGuardianArray,
      " or "
    );
    data.listOfRespondentMainGuardianString = joinResults(
      data.listOfRespondentMainGuardianArray,
      " or "
    );
    data.listOfChildrenTimeNoneString = joinResults(
      data.listOfChildrenTimeNoneArray,
      " or "
    );
    data.listOfChildrenString = joinResults(data.listOfChildrenArray, " or ");
    data.listOfChildrenWithPOString = joinResults(
      data.listOfChildrenWithPOArray,
      " or "
    );
    data.listOfChildrenWithoutPOString = joinResults(
      data.listOfChildrenWithoutPOArray,
      " or "
    );

    if (data.ApplicantNeedsProtection === "y") {
      data.listOfPeopleWithPOArray.push(data.applicantFullName);
    }
    if (data.listOfChildrenWithPOArray) {
      data.listOfPeopleWithPOArray = data.listOfPeopleWithPOArray.concat(
        data.listOfChildrenWithPOArray
      );
    }
    data.listOfPeopleWithPOString = joinResults(
      data.listOfPeopleWithPOArray,
      " or "
    );

    console.log("appended child is " + data.listOfChildrenWithPOArray);
    console.log(
      "appended children in string is " + data.listOfChildrenWithPOString
    );
    console.log("people who need po are " + data.listOfPeopleWithPO);
    console.log(
      "RespondentApplicantContactType are " +
        data.RespondentApplicantContactType
    );

    const contactTypes = [];
    if (data.RespondentApplicantContactType) {
      const ctypeTrans = {
        lawyer: "their lawyer",
        fjc: "their family justice counsellor",
        socialworker: "their social worker",
        mutualfamily: "mutual family member(s)",
        mutualfriend: "mutual friend(s)"
      };
      for (
        let idx = 0;
        idx < data.RespondentApplicantContactType.length;
        idx++
      ) {
        const ctype = data.RespondentApplicantContactType[idx];
        if (ctype === "other") {
          if (data.RespondentNoGoPlacesComment)
            contactTypes.push(data.RespondentApplicantContactTypeComment);
        } else {
          contactTypes.push(ctypeTrans[ctype] || ctype);
        }
      }
    }
    data.contactTypeString = joinResults(contactTypes, " or ");

    const places = (data.RespondentNoGoPlaces || []).filter(
      place => place !== "other"
    );
    if (data.RespondentNoGoPlacesComment) {
      places.push(data.RespondentNoGoPlacesComment);
    }
    data.RespondentNoGoPlacesString = joinResults(places, " or ");

    // add additional data ends here

    // Concate all strings to PORAffidavit
    data.PORAffidavit =
      "<strong>Relationship History </strong> <br/>" +
      (data.PORRelationshipHistory || "") +
      "<br/><br/><strong>Family Violence Incidents </strong> <br/>" +
      (data.PORWhatHappened || "");
    if (data.PORSpeedup === "y" && data.PORNoNotice === "n") {
      data.PORAffidavit +=
        "<br/><br/><strong>Reasons for shortening the time to reply </strong> <br/>" +
        data.PORWhyASAP;
    } else if (data.PORNoNotice === "y") {
      data.PORAffidavit +=
        "<br/> <br/> <strong>Reasons for the application to be heard without notice to the other party </strong> <br/>" +
        data.PORWhyNoNotice;
    }

    // slice PORAffidavit to each paragraph
    data.PORAffidavit = data.PORAffidavit.replace(/\n/g, "<br/>");
    const PORAffidavitSplit = data.PORAffidavit.split("<br/>");
    console.log("POR Message: " + data.PORAffidavit);
    console.log("POR Length: " + data.PORAffidavit.length);

    // First page
    let i = 1;
    data.PORAffidavit = PORAffidavitSplit[0] + "<br/>";
    let len = 120;
    for (; i < PORAffidavitSplit.length; i++) {
      len += PORAffidavitSplit[i].length + 120;
      if (len < 5000) {
        data.PORAffidavit += PORAffidavitSplit[i] + "<br/>";
      } else {
        break;
      }
    }

    // Other pages
    let j = 0;
    let sub_length = 0;
    while (i < PORAffidavitSplit.length) {
      sub_length += PORAffidavitSplit[i].length + 120;
      if (sub_length < 7100) {
        // Last page should have more space for signature
        if (i === PORAffidavitSplit.length - 1) {
          if (sub_length > 5100) {
            j++;
          }
        }
        if (data.PORAffidavitArray[j] !== undefined) {
          data.PORAffidavitArray[j] += PORAffidavitSplit[i] + "<br/>";
        } else {
          data.PORAffidavitArray[j] = PORAffidavitSplit[i] + "<br/>";
        }
        i++;
      } else {
        sub_length = 0;
        j++;
      }
    }
    this.data = data;

    this.resultJson = JSON.stringify(data);

    // console.log("resultJson is: " + this.resultJson);

    this.resultJson = JSON.stringify(data);
    this.jsonObject = JSON.parse(this.resultJson);

    this.printUrl = this.dataService.getApiUrl(
      "survey-print/" + this.cacheName
    );
  }

  onPrint() {
    this.matomoTracker.trackEvent("Survey", "Printed");
  }
}
