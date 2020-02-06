import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit
} from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators
} from '@angular/forms';
import {
  compilePipeFromMetadata,
  ThrowStmt
} from '@angular/compiler';
var $ = require('jquery');
import {
  saveAs
} from 'file-saver';
import {
  HttpClient
} from '@angular/common/http';
import {
  htmlAstToRender3Ast
} from '@angular/compiler/src/render3/r3_template_transform';
import {
  findLast
} from '@angular/compiler/src/directive_resolver';
import {
  appendFile
} from 'fs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Building table with forms';
  public rows: Array < {
    name: string,
    age: number,
    address: string,
    contact: number,
    gender: string,
    hobbies
  } >= [];
  gender;
  file;
  formdata;
  name;
  contact;
  age;
  address;
  hobbies = [{
    id: 1,
    name: "Reading",
    checked: false
  }, {
    id: 2,
    name: "Dancing",
    checked: false
  }]
  checkedList = []

  constructor() {
    this.rows = [];
  }
  appendToTable(finalData) {
    this.rows.push({
      name: finalData[0],
      age: finalData[1],
      address: finalData[2],
      contact: finalData[3],
      gender: finalData[4],
      hobbies: finalData[5]
    });
  }
  addData(data) {
    data.hobbies = this.checkedList;
    console.log(data);
    this.rows.push({
      name: data.name,
      age: data.age,
      address: data.address,
      contact: data.contact,
      gender: data.gender,
      hobbies: data.hobbies
    });
    this.name = null;
    this.address = null;
    this.age = null;
    this.contact = null
    this.formdata.reset();
    this.checkedList = [];
  }
  ngOnInit() {
    this.formdata = new FormGroup({
      name: new FormControl("", Validators.compose([
        Validators.required
      ])),
      contact: new FormControl("", Validators.compose([
        Validators.required,
      ])),
      age: new FormControl("", Validators.compose([
        Validators.required
      ])),
      address: new FormControl("", Validators.compose([
        Validators.required
      ])),
      gender: new FormControl("", Validators.compose([
        Validators.required
      ])),
      hobby: new FormControl("", Validators.compose([
        Validators.required
      ]))
    });
  }
  showForm(event) {
    var btn = event.target;
    var form = document.getElementById("form1");
    if (form.style.display === "none") {
      form.style.display = "block"
      btn.value = "Hide form";
    } else {
      form.style.display = "none"
      btn.value = "Show form";
    }
  }
  onCheckboxChange(option, event) {
    if (event.target.checked) {
      this.checkedList.push(option.name);
    } else {
      for (var i = 0; i < this.hobbies.length; i++) {
        if (this.checkedList[i] == option.name) {
          this.checkedList.splice(i, 1);
        }
      }
    }
  }
  export () {
    var tRows = document.getElementById("table1").querySelectorAll("table tr");
    var headers = document.getElementsByTagName("th");
    var data = {};
    var index = 0;
    for (var i = 0; i < tRows.length; i++) {
      var tds = tRows[i].querySelectorAll('td');
      if (tds.length > 0) {
        data[index] = [];
        for (var j = 0; j < tds.length; j++)
          data[index].push(("" + headers[j].textContent + ":" + tds[j].textContent + ""));
        index++;
      }
    }
    var json = JSON.stringify(data);
    var bytes = new Blob([json], {
      type: "application/json;charset=utf-8"
    });
    saveAs(bytes, "data.txt");
  }
  onFileSelected(event) {
    this.file = event.target.files[0];
    var reader = new FileReader();

    reader.onload = function (e) {
      var text = reader.result.toString();
      console.log(text);
      var newArray = [];
      var lines = text.split(/[:,"]+/);
      console.log(lines)
      for (var i = 0; i < lines.length; i++) {
        var count = 0;
        if (count < 8) {
          newArray.push(lines[i])
        } else if (count % 16 == 0) {
          newArray.push(lines[i])
        }
        count = 0;
        continue;
      }
      console.log(newArray);
      var filtered = newArray.filter(function (element) {
        return element !== "Actions" &&
          element !== "{" &&
          element !== "[" &&
          element !== "EditDelete" &&
          element !== "ID" && element !== "Age" && element !== "Contact" && element !== "Address" &&
          element !== "Gender" && element !== "Hobbies" && element !== "Name" && element != "]" && element !== "]}"
      })
      console.log(filtered)
      var finalData = [];
      var col = 0;
      for (var i = 1; i < filtered.length; i++) {
        if ((filtered[i] == "Reading" && filtered[i + 1] == "Dancing") || (filtered[i] == "Dancing" && filtered[i + 1] == "Reading")) {
          console.log("inside 1st if");
          filtered[i] += filtered[i + 1];
          filtered.splice(i + 1, 1);
        }
        console.log(filtered[i]);
        if (i % 7 == 0) {
          col = 0;
          event.appendToTable(finalData);
          continue;
        }
        finalData[col++] = filtered[i];
      }
      console.log(finalData);
      event.appendToTable(finalData);
    }
    reader.readAsText(this.file);
  }
  editFunction() {
    var btn1 = document.getElementById("btnAdd");
    btn1.style.display = "none";
    var btn2 = document.getElementById("btnUpdate");
    btn2.style.display = "block";
    var formcontrol1 = $('table td:eq(0)').text();
    var formcontrol2 = $('table td:eq(1)').text();
    var formcontrol3 = $('table td:eq(2)').text();
    var formcontrol4 = $('table td:eq(3)').text();
    var gender = $('table td:eq(4)').text();
    console.log(gender);
    var hobbies = $('table td:eq(5)').text();
    console.log(hobbies);
    this.formdata.patchValue({
      name: formcontrol1,
      age: formcontrol2,
      address: formcontrol3,
      contact: formcontrol4
    });
    if (gender == "Female") {
      $(document.getElementById("femaleRadio")).prop('checked', true)
    } else if (gender == "Male") {
      $(document.getElementById("maleRadio")).prop('checked', true)
    }
    // Hobbies
    var selectedHobbyArray = [];
    if (hobbies == "Reading") {
      selectedHobbyArray.push("Reading")
    } else if (hobbies == "Reading,Dancing" || hobbies == "Dancing,Reading") {
      selectedHobbyArray.push("Reading");
      selectedHobbyArray.push("Dancing");
    } else if (hobbies == "Dancing") {
      selectedHobbyArray.push("Dancing")
    } else {
      selectedHobbyArray.push("");
    }
    console.log(selectedHobbyArray);
    var selecthobby = document.getElementsByName("hobbies");
    console.log(selecthobby);
    for (var h in selecthobby) {
      if (selectedHobbyArray.includes("Reading")) {

      }
    }
  }
  updateFunction() {
    var edtbtn = document.getElementById("edtbtn")
    console.log(edtbtn);
    var name = this.formdata.controls['name'].value;
    var age = this.formdata.controls['age'].value;
    var address = this.formdata.controls['address'].value;
    var contact = this.formdata.controls["contact"].value;
    var gender = this.formdata.controls['gender'].value;
    console.log(gender);
    var row = edtbtn.closest('tr').children;
    for (var i = 0; i < row.length; i++) {
      row[0].textContent = name;
      row[1].textContent = age;
      row[2].textContent = address;
      row[3].textContent = contact;
      row[4].textContent = gender;
    }
  }
  
    /*var row = $("<tr>")
row.append($("<td>" + finalData[0] + "</td>"))
row.append($("<td>" + finalData[1] + "</td>"))
row.append($("<td>" + finalData[2] + "</td>"))
row.append($("<td>" + finalData[3] + "</td>"))
row.append($("<td>" + finalData[4] + "</td>"))
row.append($("<td>" + finalData[5] + "</td>"))
$("#table1").append(row);*/

}