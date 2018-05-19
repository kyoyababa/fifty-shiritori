import { Component, OnInit } from '@angular/core';


export interface IHistoryItem {
  word: string;
  createdBy: string;
}

export interface IUser {
  name: string;
  color: string;
  history: Array<IHistoryItem>;
  isAnswerer: boolean;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public selectedPersonLength: number = 4;
  public currentState = 'USER_SETTING';
  public currentAnswer: string = null;
  public isShiritoriEstablished: boolean = true;
  public isAnswerHiragana: boolean = true;
  public round: number = 1;

  public personSuggetions: Array<number> = [];
  public users: Array<IUser> = [];
  public history: Array<IHistoryItem> = [];
  public score: Object = {};

  protected chars = 'あいうえおぁぃぅぇぉかきくけこがぎぐげごさしすせそざじずぜぞたちつてと　　っ　　だぢづでどなにぬねのはひふへほばびぶべぼぱぴぷぺぽまみむめもや　ゆ　よゃ　ゅ　ょらりるれろわーん'.split('');

  constructor() {}

  ngOnInit() {
    for (let i = 1; i <= 7; i++) {
      this.personSuggetions.push(i);
    }

    this.resetUsers();
    this.resetHistory();
  }

  private resetUsers(): void {
    this.users = [];
    for (let i = 1; i <= this.selectedPersonLength; i++) {
      this.users.push({
        name: null,
        color: this.getUserColor('index', i),
        history: [],
        isAnswerer: false
      });
    }
  }

  private getUserColor(key: string, value: any): string {
    const colorScheme = ['#FF6D00', '#FFD600', '#64DD17', '#00BFA5', '#0091EA', '#6200EA', '#D50000'];

    switch (key) {
      case 'index':
        return colorScheme[value - 1];

      case 'name':
        const targetUser = this.users.find(user => user.name === value);
        if (targetUser) return targetUser.color;
        break;

      default:
        throw new Error(`ERROR: The key ${key} is not under consideration.`);
    }
  }

  private isShiritoriConnected(beforeWord: string, currentWord: string): boolean {
    if (!beforeWord || !currentWord) return false;

    if (currentWord.slice(-1) === 'ん') return false;
    if (currentWord.slice(-1) === 'ー' && currentWord.slice(-2).slice(0, 1) === 'ー') return false;

    const exp = currentWord.slice(0, 1);

    if (beforeWord.slice(-1) === 'ぁ') return exp === 'あ';
    if (beforeWord.slice(-1) === 'ぃ') return exp === 'い';
    if (beforeWord.slice(-1) === 'ぅ') return exp === 'う';
    if (beforeWord.slice(-1) === 'ぇ') return exp === 'え';
    if (beforeWord.slice(-1) === 'ぉ') return exp === 'お';
    if (beforeWord.slice(-1) === 'っ') return exp === 'つ';
    if (beforeWord.slice(-1) === 'ゃ') return exp === 'や';
    if (beforeWord.slice(-1) === 'ゅ') return exp === 'ゆ';
    if (beforeWord.slice(-1) === 'ょ') return exp === 'よ';
    if (beforeWord.slice(-1) === 'ー') return exp === beforeWord.slice(-2).slice(0, 1);

    return exp === beforeWord.slice(-1);
  }

  private isUserSettingFormValid(): boolean {
    return this.users.filter(user => user.name === '' || user.name === null).length === 0;
  }

  public onSubmit(formKey: string): void {
    switch(formKey) {
      case 'userSettingForm':
        if (!this.isUserSettingFormValid()) return;
        this.users[0].isAnswerer = true;
        this.currentState = 'ANSWER';
        break;

      case 'answerForm':
        // judge if after word includes some non-hiragana onChangeUsers
        this.isAnswerHiragana = this.currentAnswer.replace(/ー/g, '').match(/^[\u3040-\u309F]+$/) !== null;

        // judge if shiritori is established
        this.isShiritoriEstablished = this.isShiritoriConnected(this.history.slice(-1)[0].word, this.currentAnswer);

        if (!this.isAnswerHiragana || !this.isShiritoriEstablished) return;

        const currentAnswererIndex = this.users.map(user => user.name).indexOf(this.getCurrentAnswerer().name);
        const historyItem = {
          word: this.currentAnswer,
          createdBy: this.getCurrentAnswerer().name
        }

        this.history.push(historyItem);
        this.users[currentAnswererIndex].history.push(historyItem);

        this.users[currentAnswererIndex].isAnswerer = false;
        if (this.users[currentAnswererIndex + 1]) {
          this.users[currentAnswererIndex + 1].isAnswerer = true;
        } else {
          this.round++;
          this.users[0].isAnswerer = true;
        }

        this.currentAnswer = '';
        break;

      default:
        throw new Error(`ERROR: The formKey ${formKey} is not under consideration.`);
    }
  }

  public getAnswererColor(char: string): string {
    let isFound = false;

    for (let i = 0; i < this.history.length; i++) {
      if (!isFound && this.history[i].createdBy !== 'System' && this.history[i].word.indexOf(char) >= 0) {
        isFound = true;

        return this.getUserColor('name', this.history[i].createdBy);
      }
    }
  }

  public onChangeSelectedPersonLength(): void {
    this.resetUsers();
  }

  private resetHistory(): void {
    this.history.push({
      word: 'しりとり',
      createdBy: 'System'
    });
  }

  public getCurrentAnswerer(): IUser {
    return this.users.find(user => user.isAnswerer);
  }
}
