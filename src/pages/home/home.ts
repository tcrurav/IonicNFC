import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { NFC, Ndef } from '@ionic-native/nfc';
import { Subscription } from 'rxjs/Rx'

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  readingTag: boolean = false;
  writingTag: boolean = false;
  isWriting: boolean = false;
  ndefMsg: string = '';

  subscriptions: Array<Subscription> = new Array<Subscription>();

  consoleOutput: Array<string> = [];

  constructor(public navCtrl: NavController,
    public nfc: NFC, public ndef: Ndef) {

    this.listenToNdef();      //Método para leer/escribir Tags en el formato Ndef
    this.listenToAnyTag();    //Método para leer/escribir cualquier tag
    //this.nfcFromIonicWeb(); //Método para leer/escribir entre móviles 
  }

  listenToNdef() {
    this.subscriptions.push(this.nfc.addNdefListener()
      .subscribe(data => {
        console.log("tibu: Ndef event");
        this.consoleOutput.push("Ndef event");
        if (this.readingTag) {
          let payload = data.tag.ndefMessage[0].payload;
          let tagContent = this.nfc.bytesToString(payload);
          this.readingTag = false;

          this.ndefMsg = tagContent;

          console.log("tibu: Read Ndef Message: " + tagContent);
          this.consoleOutput.push("Read Ndef Message: " + tagContent);
          console.log("tibu: Read Ndef Message: " + JSON.stringify(data));
          this.consoleOutput.push("Read Ndef Message: " + JSON.stringify(data));
        }
        else if (this.writingTag) {
          if (!this.isWriting) {
            this.isWriting = true;
            this.nfc.write([this.ndefMsg])
              .then(() => {
                this.writingTag = false;
                this.isWriting = false;
                console.log("tibu: Written Ndef Message");
                this.consoleOutput.push("Written Ndef Message");
              })
              .catch(err => {
                this.writingTag = false;
                this.isWriting = false;
                console.log("tibu: Ndef Error writting: " + err);
                this.consoleOutput.push("Ndef Error writting: " + err);
              });
          }
        }
      },
        err => {
          console.log("tibu: Ndef error: " + err);
          this.consoleOutput.push("Ndef Error: " + err);
        })
    );
  }

  listenToAnyTag() {
    this.subscriptions.push(this.nfc.addTagDiscoveredListener()
      .subscribe(data => {
        console.log("tibu: TagDiscovered event");
        this.consoleOutput.push("TagDiscovered event");
        if (this.readingTag) {
          const tagId = this.nfc.bytesToHexString(data.tag.id);

          console.log("tibu: TagDiscovered tagId: " + tagId);
          this.consoleOutput.push("TagDiscovered tagId: " + tagId);
          console.log("tibu: TagDiscovered JSON.stringify(data): " + JSON.stringify(data));
          this.consoleOutput.push("TagDiscovered JSON.stringify(data): " + JSON.stringify(data));
          console.log("tibu: Read TagDiscovered Message");
          this.consoleOutput.push("Read TagDiscovered Message");
        }
        else if (this.writingTag) {
          if (!this.isWriting) {
            this.isWriting = true;
            // this.nfc.write([this.ndefMsg])
            //   .then(() => {
            //     this.writingTag = false;
            //     this.isWriting = false;
            //     console.log("tibu: Written TagDiscovered Message");
            //     this.consoleOutput.push("Written TagDiscovered Message");
            //   })
            //   .catch(err => {
            //     this.writingTag = false;
            //     this.isWriting = false;
            //     console.log("tibu: TagDiscovered error writting: " + err);
            //     this.consoleOutput.push("TagDiscovered Error writting: " + err);
            //   });
            this.writeTag(this.ndefMsg);
            this.writingTag = false;
            this.isWriting = false;
            console.log("tibu: Written TagDiscovered Message");
            this.consoleOutput.push("Written TagDiscovered Message");
          }
        }
      },
        err => {
          console.log(err + "tibu: TagDiscovered error: " + err);
          this.consoleOutput.push("TagDiscovered Error: " + err);
        })
    );
  }

  ionViewWillLeave() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
      console.log("tibu: unsubscribed");
    });
  }

  readTag() {
    this.readingTag = true;
  }

  writeTag(writeText: string) {
    this.writingTag = true;
    let ndefRecord = this.ndef.textRecord(writeText);
    this.ndefMsg = JSON.stringify(ndefRecord);
  }

  showSubscriptionsNumber() {
    console.log("tibu: subscripciones: " + this.subscriptions.length);
    this.consoleOutput.push("subscripciones: " + this.subscriptions.length);
  }

  nfcFromIonicWeb() {
    this.nfc.addNdefListener(() => {
      console.log('tibu: successfully attached ndef listener');
    }, (err) => {
      console.log('tibu: error attaching ndef listener', err);
    }).subscribe((event) => {
      console.log('tibu: received ndef message. the tag contains: ', event.tag);
      this.consoleOutput.push("received ndef message. the tag contains: " + event.tag); 
      console.log('tibu: decoded tag id: ', this.nfc.bytesToHexString(event.tag.id));
      this.consoleOutput.push('decoded tag id: ', this.nfc.bytesToHexString(event.tag.id)); 

      let payload = event.tag.ndefMessage[0].payload;
      let tagContent = this.nfc.bytesToString(payload);
      this.ndefMsg = tagContent;

      console.log("tibu: Read Ndef Message: " + tagContent);
      this.consoleOutput.push("Read Ndef Message: " + tagContent);

      let message = this.ndef.textRecord(this.ndefMsg);
      this.nfc.share([message]).then(() => {
        console.log("tibu: onSuccess: ");
        this.consoleOutput.push("onSuccess: ");
      }).catch((err) => {
        console.log("tibu: onError: " + err);
        this.consoleOutput.push("onError: " + err); 
      });
    });
  }
}
